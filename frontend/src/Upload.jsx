const BASE_URL = "http://localhost:8001";

export default function Upload({ setSong }) {
    const handleFile = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${BASE_URL}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setSong(data.song); // 🔥 SAME WORKING LINE

        } catch (err) {
            console.error(err);
            alert("Upload failed. Check backend.");
        }
    };

    return (
        <div
            style={dropzoneStyle}
            onClick={() => document.getElementById("file-input").click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files[0]);
            }}
        >
            <input
                id="file-input"
                type="file"
                accept=".mp3,.wav"
                hidden
                onChange={(e) => handleFile(e.target.files[0])}
            />

            <div style={{ fontSize: 28 }}>🎵</div>
            <div style={{ marginTop: 10, fontSize: 16 }}>
                Drop your audio file here
            </div>
            <div style={{ fontSize: 13, opacity: 0.6 }}>
                or click to browse (MP3 / WAV)
            </div>
        </div>
    );
}

const dropzoneStyle = {
    margin: "20px auto",
    maxWidth: 600,
    padding: "40px 20px",
    border: "2px dashed #555",
    borderRadius: 16,
    cursor: "pointer",
    textAlign: "center",
    background: "rgba(255,255,255,0.02)",
};

