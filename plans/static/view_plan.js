
document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('editButton');
    const planForm = document.getElementById('planForm');
    let isEditing = false;
    const inputElements = planForm.querySelectorAll('input, textarea');

    editButton.addEventListener('click', () => {
        isEditing = !isEditing;
        if (isEditing) {
            editButton.innerHTML = '💾 Save Plan';
            editButton.classList.remove('bg-sky-600', 'hover:bg-sky-700');
            editButton.classList.add('bg-green-600', 'hover:bg-green-700');
            inputElements.forEach(element => element.disabled = false);
        } else {
            // Get form data
            const planId = document.getElementById('planId').value;
            const formData = {
                short_name: document.getElementById('shortName').value,
                full_name: document.getElementById('fullName').value,
                summary_of_benefits: document.getElementById('benefitsSummary').value,
                summary_of_benefits_url: document.getElementById('benefitsUrl').value,
                compressed_summary: document.getElementById('compressedSummary').value
            };

            // Send update request
            fetch(`/plans/${planId}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Refresh the page to show updated data
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update plan. Please try again.');
            });

            editButton.innerHTML = '✏️ Edit Plan';
            editButton.classList.remove('bg-green-600', 'hover:bg-green-700');
            editButton.classList.add('bg-sky-600', 'hover:bg-sky-700');
            inputElements.forEach(element => element.disabled = true);
        }
    });
});
