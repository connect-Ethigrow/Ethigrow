function toggleMenu() {
            const menu = document.getElementById('mobileMenu');
            menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
        }

        

        // Clock animation
        function updateClock() {
            const now = new Date();
            const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
            const secondDeg = seconds * 6;
            document.getElementById("secondHand").style.transform = `translate(-50%, -100%) rotate(${secondDeg}deg)`;
        }
        setInterval(updateClock, 50); updateClock();

        // Scroll fade effect
        window.addEventListener("scroll", function () {
            const video = document.getElementById("bgVideo");
            const clock = document.getElementById("clockSection");
            const fadeOverlay = document.getElementById("fadeOverlay");
            let opacity = 1 - window.scrollY / 500;
            if (opacity < 0) opacity = 0;
            video.style.opacity = Math.max(opacity, 0.2);
            clock.style.opacity = opacity;
            fadeOverlay.style.opacity = window.scrollY > 150 ? 1 : 0;
        });

        // Scroll down click
        document.getElementById("scrollDown").addEventListener("click", () => {
            document.getElementById("about").scrollIntoView({ behavior: "smooth" });
        });

        // Chat functionality
        const chatButton = document.getElementById("chatButton");
        const chatBox = document.getElementById("chatBox");
        const closeChat = document.getElementById("closeChat");
        const sendBtn = document.getElementById("sendBtn");
        const userInput = document.getElementById("userInput");
        const chatMessages = document.getElementById("chatMessages");

        chatButton.addEventListener("click", () => {
            chatBox.style.display = "flex";
            if (!document.querySelector(".formCard")) {
                appendContactForm();   // show the form when chat opens first time
            }
        });
        closeChat.addEventListener("click", () => chatBox.style.display = "none");
        sendBtn.addEventListener("click", sendMessage);
        userInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

        function appendUserMsg(text) {
            const userMsg = document.createElement("div");
            userMsg.className = "chatMessage userMsg";
            userMsg.textContent = text;
            chatMessages.appendChild(userMsg);
        }

        function appendBotMsg(text) {
            const botMsg = document.createElement("div");
            botMsg.className = "chatMessage botMsg";
            botMsg.textContent = text;
            chatMessages.appendChild(botMsg);
        }

        function showTyping() {
            const typingDiv = document.createElement("div");
            typingDiv.className = "typing";
            typingDiv.innerHTML = "<span></span><span></span><span></span>";
            typingDiv.id = "typingIndicator";
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        function hideTyping() {
            const t = document.getElementById("typingIndicator");
            if (t) t.remove();
        }

        // === Lead capture card appended as a SECOND message after every bot reply ===
        function appendContactForm() {
            const wrapper = document.createElement("div");
            wrapper.className = "chatMessage cardMsg";

            const card = document.createElement("div");
            card.className = "formCard";
            card.innerHTML = `
      <div class="formCardHead">
        Hey there, please leave your details so we can contact you even if you are no longer on the site.
      </div>
      <form class="formBody leadForm">
        <div class="formGroup">
          <label for="lead_name_${Date.now()}">Name</label>
          <input id="lead_name_${Date.now()}" name="name" type="text" required />
        </div>
        <div class="formGroup">
          <label for="lead_email_${Date.now()}">Email</label>
          <input id="lead_email_${Date.now()}" name="email" type="email" required />
        </div>
        <div class="formActions">
          <button type="submit">Submit</button>
          <div class="muted">We’ll only use this to follow up about Ethigrow.</div>
        </div>
      </form>
    `;
            wrapper.appendChild(card);
            chatMessages.appendChild(wrapper);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Handle lead form submissions (event delegation)
        chatMessages.addEventListener("submit", function (e) {
            if (e.target && e.target.classList.contains("leadForm")) {
                e.preventDefault();
                const form = e.target;
                const data = Object.fromEntries(new FormData(form).entries());
                // Store locally so it survives chat close (you can replace with API later)
                try {
                    const leads = JSON.parse(localStorage.getItem("ethigrow_leads") || "[]");
                    leads.push({ ...data, ts: new Date().toISOString() });
                    localStorage.setItem("ethigrow_leads", JSON.stringify(leads));
                } catch (_) { }

                form.querySelector("button").disabled = true;
                form.querySelector("button").textContent = "Saved";
                appendBotMsg(`Thanks ${data.name || ""}! We'll reach out at ${data.email}.`);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });

        function sendMessage() {
            const text = userInput.value.trim();
            if (!text) return;

            appendUserMsg(text);
            userInput.value = "";
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Typing indicator
            showTyping();

            // After delay, bot sends TWO messages:
            // 1) Primary text reply (the "return statement should be primary")
            // 2) Contact form card (second message)
            setTimeout(() => {
                hideTyping();
                const primary = getBotResponse(text); // PRIMARY reply
                appendBotMsg(primary);                // (1) Primary
                appendContactForm();                  // (2) Form card
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1200);
        }

        // Simple intent-based bot responses
        function getBotResponse(input) {
            const q = input.toLowerCase();
            if (q.includes("hello") || q.includes("hi")) return "Hello! 👋 How can I assist you today?";
            if (q.includes("about")) return "We’re Ethigrow — crafting innovative digital experiences 🚀.";
            if (q.includes("launch")) return "We’re launching soon! Drop your email so we can notify you first.";
            if (q.includes("help")) return "Ask me about Ethigrow, our launch, or how to get early access.";
            if (q.includes("bye")) return "Goodbye! Have a wonderful day 😊";
            return "Thanks for your message! I’ll get back to you soon.";
        }