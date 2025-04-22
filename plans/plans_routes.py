
from flask import Blueprint, render_template

# Create Blueprint
plans_bp = Blueprint('plans', __name__, 
                    template_folder='templates',
                    static_folder='static',
                    url_prefix='/plans')

@plans_bp.route('/')
def show_plans():
    """Route to display the plans page"""
    from main import db_session
    from plans.plans_model import Plan
    plans = db_session.query(Plan).all()
    return render_template('plans.html', plans=plans)

@plans_bp.route('/<plan_id>')
def view_plan(plan_id):
    """Route to display a single plan's details"""
    from main import db_session
    from plans.plans_model import Plan
    plan = db_session.query(Plan).filter(Plan.id == plan_id).first()
    return render_template('view_plan.html', plan=plan)
