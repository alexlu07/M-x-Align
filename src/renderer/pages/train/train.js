function toggleDropdown() {
    const dropdown = document.querySelector('.content');
    dropdown.classList.toggle('open');
    dropdown.classList.toggle('close');

    const icon = document.querySelector('.fa-caret-down');
    icon.classList.toggle('open-icon');
    icon.classList.toggle('close-icon');
}

// .header
// onclick="toggleDropdown()"