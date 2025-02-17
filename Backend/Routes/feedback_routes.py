from flask import Blueprint, request, jsonify
from datetime import datetime
from database import feedback_collection


feedback_routes = Blueprint('feedback_routes', __name__)


@feedback_routes.route('/api/retrive', methods=['GET'])
def get_feedback():
    feedbacks = list(feedback_collection.find({}, {"_id": 0}))  # Exclude MongoDB's _id field
    return jsonify(feedbacks)


@feedback_routes.route('/api/feedback', methods=['POST'])
def feedback():
    try:
        data = request.get_json(force=True)
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400

        # Insert feedback into MongoDB
        feedback_id = feedback_collection.insert_one({"message": data["message"],
                                                       "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")})

        return jsonify({"success": True, "message": "Feedback stored!", "id": str(feedback_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
