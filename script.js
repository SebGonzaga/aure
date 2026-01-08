const modal = document.getElementById("product-modal");
const closeBtn = document.querySelector(".close-button");

// Function to open modal with specific data
function openProduct(name, price, img, desc) {
    document.getElementById("modal-title").innerText = name;
    document.getElementById("modal-price").innerText = price;
    document.getElementById("modal-img").style.backgroundImage = `url('${img}')`;
    document.getElementById("modal-desc").innerText = desc;
    modal.style.display = "block";
}

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }