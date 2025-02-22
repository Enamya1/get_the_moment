from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import random



import base64
from io import BytesIO
from PIL import Image


import os
import base64
from io import BytesIO
from PIL import Image
from flask import jsonify, request
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)

# Set up the database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:1234@localhost/disposipole_cam'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable modification tracking to save memory

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Create a User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(15))
    pictures_taken = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f"<User {self.name}, IP {self.ip_address}, Pictures {self.pictures_taken}>"

# Route to serve the main page
@app.route('/')
def index():
    return render_template('index.html')

# Route to get a random IP address for the user
@app.route('/api/ip', methods=['GET'])
def get_ip():
    ip_address = f"192.168.1.{random.randint(1, 100)}"
    return jsonify({"ip": ip_address})

# Route to create and store a new user
@app.route('/api/user', methods=['POST'])
def create_user():
    name = request.json.get('name')
    ip_address = request.json.get('ip_address')

    # Create a new user entry
    new_user = User(name=name, ip_address=ip_address)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            "message": "User created successfully!",
            "user_id": new_user.id  # Return the user ID
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to update the number of pictures taken by the user
@app.route('/api/user/<int:user_id>/take_picture', methods=['POST'])
def take_picture(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found!"}), 404

    if user.pictures_taken >= 10:
        return jsonify({"message": "Picture limit reached!"}), 400
    
    # Increment the pictures taken count
    user.pictures_taken += 1
    db.session.commit()
    
    return jsonify({"message": "Picture taken!", "pictures_taken": user.pictures_taken})




uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

# Route to upload the snapshot (image)
@app.route('/api/upload_snapshot', methods=['POST'])
def upload_snapshot():
    user_id = request.json.get('user_id')
    image_data = request.json.get('image_data')

    # Decode the base64 image
    img_data = image_data.split(",")[1]
    img_binary = base64.b64decode(img_data)

    # Save the image (you can save it as a file or in the database, here we save as a file for simplicity)
    img = Image.open(BytesIO(img_binary))
    
    # Use the current timestamp to generate a unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    image_filename = f"snapshot_{user_id}_{timestamp}.png"
    image_path = os.path.join(uploads_dir, image_filename)
    
    img.save(image_path)

    return jsonify({"message": "Snapshot uploaded successfully!"}), 200


# Initialize the database (Create tables if they don't exist)
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables at the start of the app
    app.run(debug=True)
