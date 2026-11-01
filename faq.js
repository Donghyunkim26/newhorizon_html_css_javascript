const questions = document.querySelectorAll(".faq-question");

        questions.forEach(question => {

            question.addEventListener("click", () => {

                const answer = question.nextElementSibling;

                question.classList.toggle("active");

                if (answer.style.maxHeight) {
                    answer.style.maxHeight = null;
                    question.querySelector("span").textContent = "+";
                } else {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                    question.querySelector("span").textContent = "−";
                }

            });

        });
   