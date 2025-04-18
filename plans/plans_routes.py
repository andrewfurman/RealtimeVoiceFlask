
from flask import Blueprint, render_template

# Create Blueprint
plans_bp = Blueprint('plans', __name__, 
                    template_folder='templates',
                    static_folder='static',
                    url_prefix='/plans')

@plans_bp.route('/')
def show_plans():
    """Route to display the plans page"""
    return render_template('plans.html')
