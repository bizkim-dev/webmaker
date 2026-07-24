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

// =========================================================
// 포트폴리오 데이터
// =========================================================

const portfolioData = {
    eastpower: {
        category: "MANUFACTURING",

        title: "EAST POWER METAL",

        description:
            "산업용 분전반, 배전반, 계량기함 및 동부스바를 제작하는 기업의 홈페이지입니다. 회사와 제품 정보를 명확하게 전달하고 고객이 온라인으로 견적 문의를 접수할 수 있도록 제작했습니다.",

        images: [
            {
                src: "/images/eastpower_main.png",
                alt: "이스트파워메탈 홈페이지 메인 화면",
                label: "메인"
            },
            {
                src: "/images/eastpower_product.png",
                alt: "이스트파워메탈 제품 화면",
                label: "제품"
            },
            {
                src: "/images/eastpower_inquiry.png",
                alt: "이스트파워메탈 문의 화면",
                label: "문의"
            },
            {
                src: "/images/eastpower_mobile.png",
                alt: "이스트파워메탈 모바일 화면",
                label: "모바일"
            }
        ],

        features: [
            {
                title: "반응형 홈페이지",
                text: "PC, 태블릿, 모바일 화면 최적화"
            },
            {
                title: "제품 관리",
                text: "관리자 페이지에서 제품 등록·수정·삭제"
            },
            {
                title: "견적 문의",
                text: "문의 및 첨부파일 접수, 이메일 자동 발송"
            },
            {
                title: "검색 최적화",
                text: "사이트맵, 메타태그, 검색엔진 등록"
            }
        ],

        info: [
            ["유형", "기업 홈페이지"],
            ["업종", "전기·제조업"],
            ["반응형", "적용"],
            ["관리자", "제품 관리"],
            ["문의", "메일 연동"]
        ],

        tech: [
            "HTML",
            "CSS",
            "JavaScript",
            "Supabase",
            "Resend",
            "GitHub Pages"
        ],

        website: "https://www.eastpowermetal.com"
    },

    webmaker: {
        category: "WEB DEVELOPMENT",

        title: "WEBMAKER",

        description:
            "기업과 소상공인을 위한 홈페이지 제작 서비스를 소개하기 위해 직접 기획하고 디자인부터 개발, 도메인 연결과 배포까지 진행한 홈페이지입니다. 서비스 내용과 제작 비용을 쉽게 확인하고 온라인으로 견적 문의를 접수할 수 있도록 제작했습니다.",

        images: [
            {
                src: "/images/webmaker_main.png",
                alt: "WEBMAKER 홈페이지 메인 화면",
                label: "메인"
            },
            {
                src: "/images/webmaker_price.png",
                alt: "WEBMAKER 홈페이지 가격 안내 화면",
                label: "가격"
            },
            {
                src: "/images/webmaker_inquiry.png",
                alt: "WEBMAKER 홈페이지 견적 문의 화면",
                label: "견적 문의"
            },
            {
                src: "/images/webmaker_mobile.png",
                alt: "WEBMAKER 홈페이지 모바일 화면",
                label: "모바일"
            }
        ],

        features: [
            {
                title: "반응형 홈페이지",
                text: "PC, 태블릿, 모바일 화면 최적화"
            },
            {
                title: "서비스 및 가격 안내",
                text: "제작 유형별 서비스 내용과 예상 비용 안내"
            },
            {
                title: "견적 문의",
                text: "고객정보, 예산, 문의내용 및 첨부파일 접수"
            },
            {
                title: "상담 연결",
                text: "카카오톡 상담과 온라인 문의 기능 연결"
            },
            {
                title: "검색 최적화",
                text: "사이트맵, 메타태그, 검색엔진 등록"
            }
        ],

        info: [
            ["유형", "서비스 소개 홈페이지"],
            ["업종", "홈페이지 제작"],
            ["반응형", "적용"],
            ["가격 안내", "제작 유형별 구성"],
            ["문의", "견적 접수·카카오톡 연동"]
        ],

        tech: [
            "HTML",
            "CSS",
            "JavaScript",
            "Supabase",
            "GitHub Pages",
            "SEO"
        ],

        website: "https://www.bizwebmaker.com"
    }
};


// =========================================================
// DOM 요소
// =========================================================

const portfolioModal =
    document.getElementById("portfolioModal");

const portfolioModalDialog =
    portfolioModal?.querySelector(".portfolio-modal-dialog");

const portfolioModalClose =
    document.getElementById("portfolioModalClose");

const portfolioModalCategory =
    document.getElementById("portfolioModalCategory");

const portfolioModalTitle =
    document.getElementById("portfolioModalTitle");

const portfolioMainImage =
    document.getElementById("portfolioMainImage");

const portfolioModalThumbnails =
    document.getElementById("portfolioModalThumbnails");

const portfolioProjectDescription =
    document.getElementById("portfolioProjectDescription");

const portfolioFeatureList =
    document.getElementById("portfolioFeatureList");

const portfolioProjectInfo =
    document.getElementById("portfolioProjectInfo");

const portfolioTechList =
    document.getElementById("portfolioTechList");

const portfolioSiteLink =
    document.getElementById("portfolioSiteLink");

const portfolioContactButton =
    document.getElementById("portfolioContactButton");

const portfolioCards =
    document.querySelectorAll(
        ".portfolio-card-button[data-portfolio]"
    );

let lastFocusedPortfolioCard = null;


// =========================================================
// 모달 내용 변경
// =========================================================

function setPortfolioContent(portfolioKey) {
    const data = portfolioData[portfolioKey];

    if (!data) {
        console.warn(
            `등록되지 않은 포트폴리오입니다: ${portfolioKey}`
        );

        return false;
    }

    portfolioModalCategory.textContent = data.category;
    portfolioModalTitle.textContent = data.title;
    portfolioProjectDescription.textContent = data.description;
    portfolioSiteLink.href = data.website;

    // 대표 이미지
    const firstImage = data.images[0];

    portfolioMainImage.src = firstImage.src;
    portfolioMainImage.alt = firstImage.alt;

    // 썸네일
    portfolioModalThumbnails.innerHTML = data.images
        .map((image, index) => {
            return `
                <button
                    type="button"
                    class="portfolio-thumbnail ${
                        index === 0 ? "is-active" : ""
                    }"
                    data-image="${image.src}"
                    data-alt="${image.alt}"
                >
                    <img
                        src="${image.src}"
                        alt=""
                    >

                    <span>${image.label}</span>
                </button>
            `;
        })
        .join("");

    // 주요 제작 내용
    portfolioFeatureList.innerHTML = data.features
        .map((feature) => {
            return `
                <li>
                    <strong>${feature.title}</strong>
                    <span>${feature.text}</span>
                </li>
            `;
        })
        .join("");

    // 프로젝트 정보
    portfolioProjectInfo.innerHTML = data.info
        .map(([title, value]) => {
            return `
                <div>
                    <dt>${title}</dt>
                    <dd>${value}</dd>
                </div>
            `;
        })
        .join("");

    // 사용 기술
    portfolioTechList.innerHTML = data.tech
        .map((technology) => {
            return `<span>${technology}</span>`;
        })
        .join("");

    return true;
}


// =========================================================
// 모달 열기
// =========================================================

function openPortfolioModal(card) {
    if (!portfolioModal) {
        return;
    }

    const portfolioKey = card.dataset.portfolio;
    const contentLoaded = setPortfolioContent(portfolioKey);

    if (!contentLoaded) {
        return;
    }

    lastFocusedPortfolioCard = card;

    portfolioModal.classList.add("is-open");
    portfolioModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    // 모달을 열 때 항상 맨 위에서 시작
    if (portfolioModalDialog) {
        portfolioModalDialog.scrollTop = 0;
    }

    portfolioModalClose?.focus();
}


// =========================================================
// 모달 닫기
// =========================================================

function closePortfolioModal() {
    if (!portfolioModal) {
        return;
    }

    portfolioModal.classList.remove("is-open");
    portfolioModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    lastFocusedPortfolioCard?.focus();
    lastFocusedPortfolioCard = null;
}


// =========================================================
// 카드 클릭
// =========================================================

portfolioCards.forEach((card) => {
    card.addEventListener("click", () => {
        openPortfolioModal(card);
    });

    card.addEventListener("keydown", (event) => {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            openPortfolioModal(card);
        }
    });
});


// =========================================================
// 썸네일 클릭
// 이벤트 위임 방식이므로 프로젝트가 바뀌어도 한 번만 등록
// =========================================================

portfolioModalThumbnails?.addEventListener(
    "click",
    (event) => {
        const thumbnail =
            event.target.closest(".portfolio-thumbnail");

        if (!thumbnail) {
            return;
        }

        const imageSrc = thumbnail.dataset.image;
        const imageAlt = thumbnail.dataset.alt;

        if (!imageSrc) {
            return;
        }

        portfolioMainImage.src = imageSrc;
        portfolioMainImage.alt =
            imageAlt || "포트폴리오 화면";

        portfolioModalThumbnails
            .querySelectorAll(".portfolio-thumbnail")
            .forEach((item) => {
                item.classList.remove("is-active");
            });

        thumbnail.classList.add("is-active");
    }
);


// =========================================================
// 닫기
// =========================================================

portfolioModalClose?.addEventListener(
    "click",
    closePortfolioModal
);


// 모달 검은 배경 클릭 시 닫기
portfolioModal?.addEventListener(
    "click",
    (event) => {
        if (event.target === portfolioModal) {
            closePortfolioModal();
        }
    }
);


// ESC 키로 닫기
document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            portfolioModal?.classList.contains("is-open")
        ) {
            closePortfolioModal();
        }
    }
);


// =========================================================
// 홈페이지 제작 문의
// =========================================================

portfolioContactButton?.addEventListener(
    "click",
    () => {
        closePortfolioModal();

        const contactSection =
            document.getElementById("contact");

        contactSection?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);


/* ------------------------------------------------------------------
포트폴리오 모달창 끝
------------------------------------------------------------------ */
