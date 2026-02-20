// Single user mode
localStorage.setItem("userId", 1);

/* ================= UPLOAD ================= */
document.getElementById("image-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User ID missing! Please set a valid user.");
        return;
    }

    const formData = new FormData();
    formData.append("name", document.getElementById("itemName").value);
    formData.append("category", document.getElementById("category").value);
    formData.append("color", document.getElementById("color").value);
    formData.append("user_id", userId.toString()); // force string
    formData.append("image", document.getElementById("image").files[0]);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        if (response.ok) {
            alert("Item uploaded successfully!");
            document.getElementById("image-form").reset();
        } else {
            alert(data.error || "Upload failed");
        }
    } catch (err) {
        console.error("Upload failed:", err);
        alert("Upload failed due to network or server error.");
    }
});
/* ================= GENERATE OUTFIT ================= */
async function generateOutfit() {
    const userId = localStorage.getItem("userId");
    const display = document.getElementById("outfit-display");

    // Reset display while generating
    display.innerHTML = "<p>Generating outfit...</p>";

    try {
        const response = await fetch(`/generate/${userId}`);
        const data = await response.json();

        if (!response.ok) {
            display.innerHTML = `<p>${data.error || "Not enough items to generate outfit."}</p>`;
            return;
        }

        display.innerHTML = `
            <p>Here is your outfit!</p>
            <div>
                <img id="topImg" src="${data.top.image_path}" alt="Top">
                <img id="bottomImg" src="${data.bottom.image_path}" alt="Bottom">
                <img id="shoesImg" src="${data.shoes.image_path}" alt="Shoes">
            </div>
        `;
    } catch (err) {
        console.error("Generation failed:", err);
        display.innerHTML = "<p>Generation failed due to network or server error.</p>";
    }
}