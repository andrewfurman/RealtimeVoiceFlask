
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
        
        // Set plan details
        clone.querySelector('h2').textContent = plan.name;
        clone.querySelector('.plan-type').textContent = plan.type.toUpperCase();
        clone.querySelector('.plan-type').className += ` ${typeColors[plan.type]}`;
        clone.querySelector('.deductible').textContent = `Deductible: ${plan.deductible}`;
        clone.querySelector('.pcp-visit').textContent = `PCP Visit: ${plan.pcpVisit}`;
        clone.querySelector('.specialist-visit').textContent = `Specialist Visit: ${plan.specialistVisit}`;
        clone.querySelector('.hospital').textContent = `Hospital: ${plan.hospital}`;
        clone.querySelector('.notes').textContent = `Notes: ${plan.notes}`;

        container.appendChild(clone);
    });
}
