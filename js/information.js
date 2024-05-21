function toggleDetails() {
    var detailsContainer = document.querySelector('.details-container');
    if (detailsContainer.style.display === 'block') {
        detailsContainer.style.display = 'none';
    } else {
        detailsContainer.style.display = 'block';
    }
}
