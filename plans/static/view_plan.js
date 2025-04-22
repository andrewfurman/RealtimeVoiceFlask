// Plan data structure based on the guide
const plans = {
    gold: [
        {
            name: "Keystone HMO Gold Proactive",
            type: "gold",
            deductible: "Tier 1: $0, Tier 2: $0, Tier 3: $0",
            pcpVisit: "Tier 1: $15, Tier 2: $30, Tier 3: $45",
            specialistVisit: "Tier 1: $40, Tier 2: $60, Tier 3: $80",
            hospital: "Tier 1: $350/day¹, Tier 2: $700/day¹, Tier 3: $1,100/day¹",
            notes: "HMO, Tiered Network, Mandatory Generics, Preferred Pharmacy"
        },
        {
            name: "Personal Choice® PPO Gold",
            type: "gold",
            deductible: "$0",
            pcpVisit: "$30",
            specialistVisit: "$65",
            hospital: "$750/day¹",
            notes: "PPO, Standard Pharmacy Network, Most Popular"
        }
    ],
    silver: [
        {
            name: "Keystone HMO Silver Proactive",
            type: "silver",
            deductible: "Tier 1: $0, Tier 2: $6,000, Tier 3: $6,000",
            pcpVisit: "Tier 1: $40, Tier 2: $70, Tier 3: $80",
            specialistVisit: "Tier 1: $90, Tier 2: $140, Tier 3: $150",
            hospital: "Tier 1: $600/day¹, Tier 2: After ded & $900/day¹, Tier 3: After ded & $1,300/day¹",
            notes: "HMO, Tiered, Most Popular, Mandatory Generics"
        }
    ],
    bronze: [
        {
            name: "Keystone HMO Bronze",
            type: "bronze",
            deductible: "$8,500",
            pcpVisit: "$75 (no deductible)",
            specialistVisit: "$150 (no deductible)",
            hospital: "After ded & $700/day¹",
            notes: "HMO, Most Popular, Mandatory Generics, Preferred Pharmacy"
        }
    ]
};

// Color mapping for plan types
const typeColors = {
    gold: "bg-yellow-100 text-yellow-800",
    silver: "bg-gray-100 text-gray-800",
    bronze: "bg-amber-100 text-amber-800"
};

document.addEventListener('DOMContentLoaded', () => {
    // Initial display of all plans
    displayPlans('all');

    // Filter button event listeners
    document.getElementById('showAll').addEventListener('click', () => displayPlans('all'));
    document.getElementById('showGold').addEventListener('click', () => displayPlans('gold'));
    document.getElementById('showSilver').addEventListener('click', () => displayPlans('silver'));
    document.getElementById('showBronze').addEventListener('click', () => displayPlans('bronze'));

    const editButton = document.getElementById('editButton');
    const planForm = document.getElementById('planForm');
    const formInputs = planForm.querySelectorAll('input, textarea');
    let isEditing = false;

    editButton.addEventListener('click', () => {
        isEditing = !isEditing;

        if (isEditing) {
            // Enable editing
            editButton.innerHTML = '💾 Save Plan';
            editButton.classList.remove('bg-sky-600', 'hover:bg-sky-700');
            editButton.classList.add('bg-green-600', 'hover:bg-green-700');
            formInputs.forEach(input => input.disabled = false);
        } else {
            // Save changes
            savePlanChanges();
        }
    });

    async function savePlanChanges() {
        const planId = document.getElementById('planId').value;
        const formData = new FormData(planForm);
        const planData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/plans/${planId}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(planData)
            });

            if (response.ok) {
                // Disable editing
                editButton.innerHTML = '✏️ Edit Plan';
                editButton.classList.remove('bg-green-600', 'hover:bg-green-700');
                editButton.classList.add('bg-sky-600', 'hover:bg-sky-700');
                formInputs.forEach(input => input.disabled = true);

                // Update page title with new full name
                document.getElementById('planTitle').textContent = planData.full_name;

                // Show success message
                alert('Plan updated successfully!');
            } else {
                throw new Error('Failed to update plan');
            }
        } catch (error) {
            alert('Error updating plan: ' + error.message);
            // Revert to edit mode on error
            isEditing = true;
        }
    }
});

function displayPlans(filterType) {
    const container = document.getElementById('plansContainer');
    const template = document.getElementById('planCardTemplate');
    container.innerHTML = '';

    let plansToShow = [];
    if (filterType === 'all') {
        plansToShow = [...plans.gold, ...plans.silver, ...plans.bronze];
    } else {
        plansToShow = plans[filterType];
    }

    plansToShow.forEach(plan => {
        const clone = template.content.cloneNode(true);

        // Set plan details  - Modified to include input fields
        clone.querySelector('h2').textContent = plan.name;
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = plan.name;
        nameInput.disabled = true;
        nameInput.classList.add('w-full', 'p-2', 'border', 'border-gray-300', 'rounded');
        clone.querySelector('h2').replaceWith(nameInput);


        clone.querySelector('.plan-type').textContent = plan.type.toUpperCase();
        clone.querySelector('.plan-type').className += ` ${typeColors[plan.type]}`;

        const inputFields = ['deductible', 'pcpVisit', 'specialistVisit', 'hospital', 'notes'];
        inputFields.forEach(field => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = plan[field];
            input.disabled = true;
            input.classList.add('w-full', 'p-2', 'border', 'border-gray-300', 'rounded');
            input.name = field; // added for form submission

            const label = clone.querySelector(`.${field}`);
            label.parentNode.replaceWith(input);
        });

        container.appendChild(clone);
    });
}