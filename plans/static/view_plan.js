// Color mapping for plan types
const typeColors = {
    gold: "bg-yellow-100 text-yellow-800",
    silver: "bg-gray-100 text-gray-800",
    bronze: "bg-amber-100 text-amber-800"
};

document.addEventListener('DOMContentLoaded', () => {
    // Initial display of all plans -  This will need to be replaced with a fetch call to get data
    displayPlans('all');

    // Filter button event listeners
    document.getElementById('showAll').addEventListener('click', () => displayPlans('all'));
    document.getElementById('showGold').addEventListener('click', () => displayPlans('gold'));
    document.getElementById('showSilver').addEventListener('click', () => displayPlans('silver'));
    document.getElementById('showBronze').addEventListener('click', () => displayPlans('bronze'));

    const editButton = document.getElementById('editButton');
    const planForm = document.getElementById('planForm');
    const planId = document.getElementById('planId').value;
    let isEditing = false;
    const inputElements = planForm.querySelectorAll('input, textarea');

    editButton.addEventListener('click', async () => {
        isEditing = !isEditing;

        if (isEditing) {
            // Enter edit mode
            editButton.innerHTML = '💾 Save Plan';
            editButton.classList.remove('bg-sky-600', 'hover:bg-sky-700');
            editButton.classList.add('bg-green-600', 'hover:bg-green-700');
            inputElements.forEach(element => element.disabled = false);
        } else {
            try {
                // Save changes
                const formData = {
                    short_name: document.getElementById('shortName').value,
                    full_name: document.getElementById('fullName').value,
                    summary_of_benefits: document.getElementById('benefitsSummary').value,
                    summary_of_benefits_url: document.getElementById('benefitsUrl').value,
                    compressed_summary: document.getElementById('compressedSummary').value
                };

                const response = await fetch(`/plans/${planId}/update`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Failed to update plan');
                }

                // Exit edit mode
                editButton.innerHTML = '✏️ Edit Plan';
                editButton.classList.remove('bg-green-600', 'hover:bg-green-700');
                editButton.classList.add('bg-sky-600', 'hover:bg-sky-700');
                inputElements.forEach(element => element.disabled = true);

                // Reload the page to show updated data
                window.location.reload();
            } catch (error) {
                console.error('Error updating plan:', error);
                alert('Error updating plan: ' + error.message);
                isEditing = true; // Stay in edit mode if there's an error
            }
        }
    });
});

function displayPlans(filterType) {
    const container = document.getElementById('plansContainer');
    const template = document.getElementById('planCardTemplate');
    container.innerHTML = '';

    // This section needs to be replaced with a fetch call and data rendering logic
    // Placeholder - replace with actual data fetching and rendering
    let plansToShow = [];
    if (filterType === 'all') {
        plansToShow = [{name: "Plan 1", type: "gold", deductible: "100", pcpVisit: "20", specialistVisit: "40", hospital: "500", notes: "Note 1"},
                       {name: "Plan 2", type: "silver", deductible: "200", pcpVisit: "30", specialistVisit: "60", hospital: "600", notes: "Note 2"},
                       {name: "Plan 3", type: "bronze", deductible: "300", pcpVisit: "40", specialistVisit: "80", hospital: "700", notes: "Note 3"}];
    } else {
        plansToShow = [{name: "Plan 1", type: "gold", deductible: "100", pcpVisit: "20", specialistVisit: "40", hospital: "500", notes: "Note 1"}];
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
        nameInput.name = 'name'; // added for form submission
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