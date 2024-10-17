class Person {
    constructor(firstName, lastName, email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }
}

class Staff extends Person {
    constructor(picture, firstName, lastName, email, status, outTime, duration, expectedReturnTime) {
        super(firstName, lastName, email);
        this.picture = picture;
        this.status = status;
        this.outTime = outTime;
        this.duration = duration;
        this.expectedReturnTime = expectedReturnTime;
        this.notified = false; 
    }
}

class DeliveryDriver extends Person {
    constructor(firstName, lastName, telephone, address, vehicleType, expectedReturnTime) {
        super(firstName, lastName, telephone);
        this.telephone = telephone;
        this.address = address;
        this.vehicleType = vehicleType;
        this.expectedReturnTime = expectedReturnTime;
        this.notified = false; 
    }
}

let staffMembers = [];
let deliveryDrivers = [];

function digitalClock() {
    const clockElement = document.getElementById('digital-clock');
    setInterval(() => {
        const now = new Date();
        clockElement.textContent = formatDateTime(now);
    }, 1000);
    console.log('Digital clock initialized');
}

async function staffUserGet() {
    try {
        const response = await fetch('https://randomuser.me/api/?results=5&nat=us');
        const data = await response.json();
        staffMembers = data.results.map(user => new Staff(
            user.picture.thumbnail,
            user.name.first,
            user.name.last,
            user.email,
            'In', 
            'N/A', 
            'N/A', 
            'N/A' 
        ));
        console.log('Staff members fetched:', staffMembers);
        populateStaffTable(staffMembers);
    } catch (error) {
        console.error('Error fetching staff data:', error);
    }
}

function populateStaffTable(staffMembers) {
    const staffTableBody = document.querySelector('#staff-table tbody');
    staffTableBody.innerHTML = ''; 

    staffMembers.forEach((staff, index) => {
        const row = document.createElement('tr');
        row.dataset.index = index;
        row.innerHTML = `
            <td><img src="${staff.picture}" alt="Staff Picture"></td>
            <td>${staff.firstName}</td>
            <td>${staff.lastName}</td>
            <td>${staff.email}</td>
            <td>${staff.status}</td>
            <td>${staff.outTime}</td>
            <td>${staff.duration}</td>
            <td>${staff.expectedReturnTime}</td>
        `;
        row.addEventListener('click', () => selectRow(row));
        staffTableBody.appendChild(row);
    });
    console.log('Staff table populated');
}

function selectRow(row) {
    
    row.classList.toggle('selected');
    console.log('Row selected:', row);
}


function formatDateTime(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function staffOut() {
    const selectedRow = document.querySelector('#staff-table tbody tr.selected');
    if (!selectedRow) {
        alert('Please select a staff member.');
        return;
    }

    const index = selectedRow.dataset.index;
    const staff = staffMembers[index];

    const minutes = prompt('Enter the length of absence in minutes:');
    if (minutes === null || isNaN(minutes) || minutes <= 0) {
        alert('Invalid input. Please enter a positive number.');
        return;
    }

    const now = new Date();
    const outTime = formatDateTime(now);
    const duration = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
    const expectedReturnTime = new Date(now.getTime() + minutes * 60000);

    staff.status = 'Out';
    staff.outTime = outTime;
    staff.duration = duration;
    staff.expectedReturnTime = expectedReturnTime; 
    staff.notified = false; 
    populateStaffTable(staffMembers);
    console.log('Staff marked as out:', staff);
}

function staffIn() {
    const selectedRow = document.querySelector('#staff-table tbody tr.selected');
    if (!selectedRow) {
        alert('Please select a staff member.');
        return;
    }

    const index = selectedRow.dataset.index;
    const staff = staffMembers[index];

    staff.status = 'In';
    staff.outTime = 'N/A';
    staff.duration = 'N/A';
    staff.expectedReturnTime = 'N/A';
    staff.notified = false; 

    populateStaffTable(staffMembers);
    console.log('Staff marked as in:', staff);
}

function staffMemberIsLate() {
    const now = new Date();

    staffMembers.forEach(staff => {
        if (staff.status === 'Out' && !staff.notified && staff.expectedReturnTime !== 'N/A') {
            const expectedReturnTime = new Date(staff.expectedReturnTime);

            
            if (isNaN(expectedReturnTime.getTime())) {
                console.error(`Invalid expected return time for ${staff.firstName} ${staff.lastName}: ${staff.expectedReturnTime}`);
                return;
            }

            console.log(`Checking if staff is late: ${staff.firstName} ${staff.lastName}`);
            console.log(`Current time: ${now.toISOString()}, Expected return time: ${expectedReturnTime.toISOString()}`);

           
            if (now >= expectedReturnTime && staff.status === 'Out') {
                staff.notified = true; 
                showToast(staff, now - expectedReturnTime);
                console.log('Staff is late:', staff);
            }
        }
    });
}

function deliveryDriverIsLate() {
    const now = new Date();

    deliveryDrivers.forEach(driver => {
        if (!driver.notified && driver.expectedReturnTime !== 'N/A') {
            const expectedReturnTime = new Date(driver.expectedReturnTime);

          
            if (isNaN(expectedReturnTime.getTime())) {
                console.error(`Invalid expected return time for ${driver.firstName} ${driver.lastName}: ${driver.expectedReturnTime}`);
                return;
            }

            console.log(`Checking if delivery driver is late: ${driver.firstName} ${driver.lastName}`);
            console.log(`Current time: ${now.toISOString()}, Expected return time: ${expectedReturnTime.toISOString()}`);

            
            if (now >= expectedReturnTime) {
                driver.notified = true; 
                showToast(driver, now - expectedReturnTime);
                console.log('Delivery driver is late:', driver);
            }
        }
    });
}

function showToast(person, delay) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';

    const delayMinutes = Math.floor(delay / 60000);
    const delaySeconds = Math.floor((delay % 60000) / 1000);

    let toastContent = `
        <div class="toast-content">
            <strong>${person.firstName} ${person.lastName}</strong>
            <p>${person.email} is late by ${delayMinutes} minutes and ${delaySeconds} seconds.</p>
            <button class="close-toast">Close</button>
        </div>
    `;

   
    if (!(person instanceof DeliveryDriver)) {
        toastContent = `
            <div class="toast-picture">
                <img src="${person.picture || ''}" alt="Person Picture">
            </div>
            ${toastContent}
        `;
    }

    toast.innerHTML = toastContent;
    toastContainer.appendChild(toast);

    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    toast.querySelector('.close-toast').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 500);
    });

    console.log('Toast shown for person:', person);
}

function addDelivery() {
    const vehicleType = document.getElementById('vehicleType').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const telephone = document.getElementById('telephone').value;
    const address = document.getElementById('address').value;
    const expectedReturnTime = document.getElementById('expectedReturnTime').value;

    if (!firstName || !lastName || !telephone || !address || !expectedReturnTime) {
        const notificationWarning = document.getElementById('notification-warning');
        notificationWarning.style.display = 'block';
        notificationWarning.innerText = 'Please fill in all fields.';
        return;
    } else {
        document.getElementById('notification-warning').style.display = 'none';
    }

    const deliveryDriver = new DeliveryDriver(firstName, lastName, telephone, address, vehicleType, expectedReturnTime);
    deliveryDrivers.push(deliveryDriver);

    const deliveryBoardTable = document.getElementById('delivery-board-table').getElementsByTagName('tbody')[0];
    const newRow = deliveryBoardTable.insertRow();

    newRow.innerHTML = `
        <td>${firstName}</td>
        <td>${lastName}</td>
        <td>${telephone}</td>
        <td>${getVehicleIcon(vehicleType)}</td>
        <td>Pending</td>
        <td>${expectedReturnTime}</td>
    `;

    document.getElementById('vehicleType').value = '';
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('telephone').value = '';
    document.getElementById('address').value = '';
    document.getElementById('expectedReturnTime').value = '';
}

function getVehicleIcon(vehicleType) {
    switch (vehicleType) {
        case 'Car':
            return '<i class="fas fa-car"></i> Car';
        case 'Bike':
            return '<i class="fas fa-bicycle"></i> Bike';
        case 'Truck':
            return '<i class="fas fa-truck"></i> Truck';
        default:
            return '';
    }
}

function clearSelectedRows() {
    const deliveryBoardTable = document.getElementById('delivery-board-table').getElementsByTagName('tbody')[0];
    deliveryBoardTable.innerHTML = ''; 
    deliveryDrivers = []; 
    console.log('Delivery board cleared');
}


document.addEventListener('DOMContentLoaded', () => {
    staffUserGet();
    digitalClock();
    setInterval(staffMemberIsLate, 1000); 
    setInterval(deliveryDriverIsLate, 1000); 
    console.log('Document loaded and scripts initialized');
});

document.getElementById('scroll-up').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('scroll-down').addEventListener('click', () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});