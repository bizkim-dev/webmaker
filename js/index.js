const faqItems = document.querySelectorAll(".faq-item");
const contactForm = document.getElementById("contactForm");

faqItems.forEach(function (item) {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", function () {
        const isOpen = item.classList.contains("active");

        faqItems.forEach(function (otherItem) {
            otherItem.classList.remove("active");

            const otherAnswer =
                otherItem.querySelector(".faq-answer");

            otherAnswer.style.maxHeight = null;
        });

        if (!isOpen) {
            item.classList.add("active");

            answer.style.maxHeight =
                answer.scrollHeight + "px";
        }
    });
});

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        alert(
            "현재 문의폼은 디자인 확인용입니다.\n" +
            "다음 단계에서 이메일 전송 기능을 연결할 예정입니다."
        );
    });
}
