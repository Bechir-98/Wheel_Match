import React from 'react';

function Footer() {
    return (
        <div>
            <footer
                id="about"
                style={{
                    backgroundColor: "#212529",
                    color: "#fff",
                    padding: "40px 20px",
                    textAlign: "center",
                    marginTop: "40px",
                    fontSize: "16px"
                }}
                className="about"
            >
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <h2>About Us</h2>
                    <p style={{ maxWidth: "600px", margin: "10px auto" }}>
                        We are dedicated to helping individuals find the perfect mobility solution that fits their condition, lifestyle, and personal preferences. Our platform connects patients, clinicians, and vendors to simplify the wheelchair selection process.
                    </p>

                    <div style={{ marginTop: "30px" }}>
                        <p>
                            Contact us: <a href="mailto:support@wheelmatch.com" style={{ color: "#fff", textDecoration: "none" }}>support@wheelmatch.com</a> | 
                            <a href="tel:+21692195666" style={{ color: "#fff", textDecoration: "none" }}> +216 92195666</a>
                        </p>
                        <p>&copy; {new Date().getFullYear()} WheelMatch. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Footer;
