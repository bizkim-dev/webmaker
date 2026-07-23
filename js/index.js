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

/* ------------------------------------------------------------------
   Supabase 설정
   - 브라우저에서는 Project URL + Publishable key 사용
   - Secret key / service_role key는 절대 넣지 않음
------------------------------------------------------------------ */

const SUPABASE_URL =
    "https://xiwjyrfobpibwxhriqen.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_5N2xK2Fo_Y8YDLq_Oh1UHg_uiUVfyti";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const STORAGE_BUCKET = "inquiry-files";
const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/zip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

function sanitizeFileName(fileName) {
    const extensionIndex = fileName.lastIndexOf(".");
    const extension =
        extensionIndex >= 0
            ? fileName.slice(extensionIndex).toLowerCase()
            : "";

    const baseName =
        extensionIndex >= 0
            ? fileName.slice(0, extensionIndex)
            : fileName;

    const safeBaseName = baseName
        .normalize("NFKD")
        .replace(/[^\w가-힣-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 80);

    return `${safeBaseName || "file"}${extension}`;
}

function getDateFolder() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}${month}${day}`;
}

function validateFiles(files) {
    if (files.length > MAX_FILE_COUNT) {
        alert(
            `첨부파일은 최대 ${MAX_FILE_COUNT}개까지 등록할 수 있습니다.`
        );

        document.getElementById("files").value = "";
        document.getElementById("files").focus();

        return false;
    }

    for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
            alert(
                `${file.name}\n` +
                "파일 크기가 10MB를 초과합니다."
            );

            document.getElementById("files").value = "";
            document.getElementById("files").focus();

            return false;
        }

        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            alert(
                `${file.name}\n` +
                "허용되지 않는 파일 형식입니다."
            );

            document.getElementById("files").value = "";
            document.getElementById("files").focus();

            return false;
        }
    }

    return true;
}


function validateContactForm({
    customerName,
    phone,
    email,
    projectType,
    budget,
    content
}) {
    /* 이름 또는 업체명 */
    if (!customerName) {
        alert("이름 또는 업체명을 입력해 주세요.");
        document.getElementById("name").focus();
        return false;
    }

    if (customerName.length > 100) {
        alert("이름 또는 업체명은 100자 이하로 입력해 주세요.");
        document.getElementById("name").focus();
        return false;
    }

    /* 연락처 */
    if (!phone) {
        alert("연락처를 입력해 주세요.");
        document.getElementById("phone").focus();
        return false;
    }

   const phonePattern = /^[0-9]{9,11}$/;

    if (!phonePattern.test(phone)) {
        alert(
            "연락처 형식이 올바르지 않습니다.\n" +
            "예: 01012345678 숫자만 입력"
        );

        document.getElementById("phone").focus();
        return false;
    }

    /* 이메일 */
    if (!email) {
        alert("이메일을 입력해 주세요.");
        document.getElementById("email").focus();
        return false;
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert(
            "이메일 형식이 올바르지 않습니다.\n" +
            "예: example@email.com"
        );

        document.getElementById("email").focus();
        return false;
    }

    if (email.length > 254) {
        alert("이메일은 254자 이하로 입력해 주세요.");
        document.getElementById("email").focus();
        return false;
    }

    /* 제작 유형 */
    if (!projectType) {
        alert("제작 유형을 선택해 주세요.");
        document.getElementById("serviceType").focus();
        return false;
    }

    /* 예상 예산 */
    if (!budget) {
        alert("예상 예산을 선택해 주세요.");
        document.getElementById("budget").focus();
        return false;
    }

    /* 문의 내용 */
    if (!content) {
        alert("문의 내용을 입력해 주세요.");
        document.getElementById("message").focus();
        return false;
    }

    if (content.length > 5000) {
        alert("문의 내용은 5000자 이하로 입력해 주세요.");
        document.getElementById("message").focus();
        return false;
    }

    return true;
}

async function uploadInquiryFiles(files) {
    const uploadedFiles = [];

    for (const file of files) {
        const safeFileName = sanitizeFileName(file.name);
        const uniqueId = crypto.randomUUID();
        const dateFolder = getDateFolder();

        const storagePath =
            `${dateFolder}/${uniqueId}_${safeFileName}`;

        const { data, error } = await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            });

        if (error) {
            throw new Error(
                `${file.name} 업로드 실패: ${error.message}`
            );
        }

        uploadedFiles.push({
            bucket: STORAGE_BUCKET,
            path: data.path,
            original_name: file.name,
            size: file.size,
            mime_type: file.type
        });
    }

    return uploadedFiles;
}

const phoneInput = document.getElementById("phone");

if (phoneInput) {
    phoneInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
    });
}

if (contactForm) {
    const submitButton =
        document.getElementById("submitButton");

    const formNotice =
        document.getElementById("formNotice");

    contactForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const customerName =
                document.getElementById("name").value.trim();

            const phone =
                document.getElementById("phone").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const projectType =
                document.getElementById("serviceType").value;

            const budget =
                document.getElementById("budget").value;

            const content =
                document.getElementById("message").value.trim();

            const fileInput =
                document.getElementById("files");

            const files =
                Array.from(fileInput.files || []);

            /*
             * 1. 입력값 유효성 검사
             * 문제가 있으면 alert 후 여기서 종료
             * Storage 업로드와 DB 저장은 실행되지 않음
             */
            const isFormValid = validateContactForm({
                customerName,
                phone,
                email,
                projectType,
                budget,
                content
            });

            if (!isFormValid) {
                return;
            }

            /*
             * 2. 첨부파일 유효성 검사
             */
            const areFilesValid =
                validateFiles(files);

            if (!areFilesValid) {
                return;
            }

            try {
                submitButton.disabled = true;
                submitButton.textContent =
                    "문의 접수 중...";

                formNotice.textContent =
                    "문의 내용과 첨부파일을 안전하게 접수하고 있습니다.";

                let uploadedFileData = [];

                /*
                 * 3. 모든 유효성 검사가 끝난 뒤
                 * 첨부파일 업로드 시작
                 */
                if (files.length > 0) {
                    uploadedFileData =
                        await uploadInquiryFiles(files);
                }

                /*
                 * 4. Supabase inquiry 테이블 저장
                 */
                const { error: inquiryError } =
                    await supabaseClient
                        .from("inquiry")
                        .insert({
                            customer_name: customerName,
                            phone: phone,
                            email: email,
                            project_type: projectType,
                            budget: budget,
                            content: content,
                            file_urls: uploadedFileData
                        });

                if (inquiryError) {
                    throw new Error(
                        `문의 저장 실패: ${inquiryError.message}`
                    );
                }

                alert(
                    "문의가 정상적으로 접수되었습니다.\n" +
                    "확인 후 연락드리겠습니다."
                );

                contactForm.reset();

                formNotice.textContent =
                    "문의가 정상적으로 접수되었습니다.";
            } catch (error) {
                console.error(
                    "문의 접수 오류:",
                    error
                );

                alert(
                    "문의 접수 중 오류가 발생했습니다.\n" +
                    error.message
                );

                formNotice.textContent =
                    "문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.";
            } finally {
                submitButton.disabled = false;
                submitButton.textContent =
                    "문의 접수하기";
            }
        }
    );
}

/* ------------------------------------------------------------------
포트폴리오 모달창
------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
    const portfolioCard = document.querySelector(
        '[data-portfolio="eastpower"]'
    );
    const portfolioModal = document.getElementById("portfolioModal");
    const portfolioModalClose = document.getElementById(
        "portfolioModalClose"
    );
    const portfolioMainImage = document.getElementById(
        "portfolioMainImage"
    );
    const portfolioThumbnails = document.querySelectorAll(
        ".portfolio-thumbnail"
    );
    const portfolioContactButton = document.getElementById(
        "portfolioContactButton"
    );

    let lastFocusedElement = null;

    if (!portfolioCard || !portfolioModal) {
        return;
    }

    function openPortfolioModal() {
        lastFocusedElement = document.activeElement;

        portfolioModal.classList.add("is-open");
        portfolioModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        window.requestAnimationFrame(() => {
            portfolioModalClose?.focus();
        });
    }

    function closePortfolioModal() {
        portfolioModal.classList.remove("is-open");
        portfolioModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");

        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    }

    portfolioCard.addEventListener("click", openPortfolioModal);

    portfolioCard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPortfolioModal();
        }
    });

    portfolioModalClose?.addEventListener(
        "click",
        closePortfolioModal
    );

    portfolioModal.addEventListener("click", (event) => {
        if (event.target === portfolioModal) {
            closePortfolioModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            portfolioModal.classList.contains("is-open")
        ) {
            closePortfolioModal();
        }
    });

    portfolioThumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener("click", () => {
            const imagePath = thumbnail.dataset.image;
            const imageAlt = thumbnail.dataset.alt || "";

            if (!imagePath || !portfolioMainImage) {
                return;
            }

            portfolioMainImage.classList.add("is-changing");

            window.setTimeout(() => {
                portfolioMainImage.src = imagePath;
                portfolioMainImage.alt = imageAlt;
                portfolioMainImage.classList.remove("is-changing");
            }, 120);

            portfolioThumbnails.forEach((item) => {
                item.classList.remove("is-active");
            });

            thumbnail.classList.add("is-active");
        });
    });

    portfolioContactButton?.addEventListener("click", () => {
        closePortfolioModal();

        window.setTimeout(() => {
            const contactSection =
                document.getElementById("contact") ||
                document.getElementById("inquiry");

            if (!contactSection) {
                return;
            }

            contactSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 250);
    });
});


/* ------------------------------------------------------------------
포트폴리오 모달창 끝
------------------------------------------------------------------ */
