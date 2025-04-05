let selected = null;

window.onload = () => {
    const listItems = document.querySelectorAll('li');

    listItems.forEach(item => {
        item.addEventListener('click', () => {
            if (selected) {
                selected.classList.remove('selected');
                selected.querySelector('i').classList.remove('fa-check');
                selected.querySelector('i').classList.add('fa-minus');
            }
            item.classList.add('selected');
            item.querySelector('i').classList.remove('fa-minus');
            item.querySelector('i').classList.add('fa-check');
            selected = item;
        });
    });
}