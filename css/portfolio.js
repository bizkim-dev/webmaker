document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       프로젝트 데이터
    ========================================================== */

    const portfolioData = {


        /* =====================================================
           EAST POWER METAL
        ====================================================== */

        eastpower: {

            category: "MANUFACTURING",

            title: "EAST POWER METAL",

            description:
                "이스트파워메탈은 부스바, 분전반, 배전반 등 전기 관련 제품을 제작하는 제조업 기업입니다. 기존 기업 정보를 단순히 보여주는 형태를 넘어 제품을 직접 등록하고 관리할 수 있도록 관리자 기능을 구성하고, 고객이 제품 확인 후 바로 견적 문의를 할 수 있도록 홈페이지를 제작했습니다.",


            images: [

                {
                    src: "/images/eastpowermetal_main.png",
                    label: "메인"
                },

                {
                    src: "/images/eastpowermetal_product.png",
                    label: "제품"
                },

                {
                    src: "/images/eastpowermetal_inquiry.png",
                    label: "견적 문의"
                },

                {
                    src: "/images/eastpowermetal_mobile.png",
                    label: "모바일"
                }

            ],


            features: [

                {
                    title: "제품 관리 시스템",
                    description:
                        "관리자 페이지에서 제품 이미지와 제품 정보를 직접 등록하고 수정할 수 있도록 구성했습니다."
                },

                {
                    title: "견적 문의 시스템",
                    description:
                        "고객이 홈페이지에서 견적 내용을 작성하고 파일을 첨부하여 문의할 수 있도록 제작했습니다."
                },

                {
                    title: "이메일 문의 연동",
                    description:
                        "새로운 견적 문의가 등록되면 담당자가 이메일로 내용을 확인할 수 있도록 연동했습니다."
                },

                {
                    title: "반응형 홈페이지",
                    description:
                        "PC, 태블릿, 스마트폰에서도 제품과 회사 정보를 편리하게 확인할 수 있도록 제작했습니다."
                },

                {
                    title: "검색엔진 기본 최적화",
                    description:
                        "Google과 네이버 검색 노출을 고려하여 페이지별 SEO 기본 구조를 적용했습니다."
                }

            ],


            info: {

                "업종": "전기 제조업",
                "형태": "기업 홈페이지",
                "제작": "WEBMAKER",
                "상태": "운영 중"

            },


            tech: [
                "HTML",
                "CSS",
                "JavaScript",
                "Supabase",
                "GitHub Pages",
                "Resend"
            ],


            site:
                "https://www.eastpowermetal.com/"

        },



        /* =====================================================
           WEBMAKER
        ====================================================== */

        webmaker: {

            category: "WEB DEVELOPMENT",

            title: "WEBMAKER",

            description:
                "WEBMAKER 홈페이지는 기업과 소규모 사업자를 대상으로 홈페이지 제작 서비스를 소개하기 위해 제작한 웹사이트입니다. 서비스 소개부터 제작 과정, 가격 안내, 포트폴리오와 견적 문의까지 사용자가 자연스럽게 확인할 수 있도록 구성했습니다.",


            images: [

                {
                    src: "/images/webmaker_main.png",
                    label: "메인"
                },

                {
                    src: "/images/webmaker_price.png",
                    label: "가격 안내"
                },

                {
                    src: "/images/webmaker_inquiry.png",
                    label: "견적 문의"
                },

                {
                    src: "/images/webmaker_mobile.png",
                    label: "모바일"
                }

            ],


            features: [

                {
                    title: "서비스 소개 구성",
                    description:
                        "홈페이지 제작 서비스와 제작 범위를 방문자가 쉽게 이해할 수 있도록 구성했습니다."
                },

                {
                    title: "제작 가격 안내",
                    description:
                        "원페이지형, 기업 홈페이지형, 맞춤 제작형으로 구분하여 예상 제작 비용을 안내합니다."
                },

                {
                    title: "포트폴리오 구성",
                    description:
                        "실제 제작 사례와 적용 기능을 확인할 수 있도록 프로젝트 포트폴리오를 구성했습니다."
                },

                {
                    title: "견적 문의 기능",
                    description:
                        "홈페이지에서 제작 유형과 예상 예산, 프로젝트 내용을 입력하여 문의할 수 있도록 제작했습니다."
                },

                {
                    title: "검색엔진 최적화",
                    description:
                        "Google과 네이버 검색 유입을 고려하여 페이지별 SEO 구조와 검색 등록 환경을 구성했습니다."
                }

            ],


            info: {

                "업종": "웹 개발",
                "형태": "서비스 홈페이지",
                "제작": "WEBMAKER",
                "상태": "운영 중"

            },


            tech: [
                "HTML",
                "CSS",
                "JavaScript",
                "Supabase",
                "GitHub Pages",
                "Resend"
            ],


            site:
                "https://www.bizwebmaker.com/"

        }

    };



    /* =========================================================
       요소
    ========================================================== */

    const modal =
        document.getElementById("portfolioModal");

    const modalClose =
        document.getElementById("portfolioModalClose");

    const modalCategory =
        document.getElementById("portfolioModalCategory");

    const modalTitle =
        document.getElementById("portfolioModalTitle");

    const mainImage =
        document.getElementById("portfolioMainImage");

    const thumbnails =
        document.getElementById("portfolioModalThumbnails");

    const description =
        document.getElementById("portfolioProjectDescription");

    const featureList =
        document.getElementById("portfolioFeatureList");

    const projectInfo =
        document.getElementById("portfolioProjectInfo");

    const techList =
        document.getElementById("portfolioTechList");

    const siteLink =
        document.getElementById("portfolioSiteLink");

    const contactButton =
        document.getElementById("portfolioContactButton");



    let lastFocusedElement = null;



    /* =========================================================
       모달 열기
    ========================================================== */

    function openPortfolioModal(key) {

        const data = portfolioData[key];

        if (!data) {
            return;
        }


        lastFocusedElement = document.activeElement;


        modalCategory.textContent =
            data.category;


        modalTitle.textContent =
            data.title;


        description.textContent =
            data.description;


        siteLink.href =
            data.site;



        /* =====================================================
           이미지
        ====================================================== */

        thumbnails.innerHTML = "";


        data.images.forEach((image, index) => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "portfolio-thumbnail";


            if (index === 0) {

                button.classList.add(
                    "is-active"
                );

            }


            button.innerHTML = `
                <img
                    src="${image.src}"
                    alt="${data.title} ${image.label} 화면"
                >

                <span>
                    ${image.label}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    changeMainImage(
                        image.src,
                        data.title,
                        image.label,
                        button
                    );

                }
            );


            thumbnails.appendChild(
                button
            );

        });



        /* 첫 이미지 */

        mainImage.src =
            data.images[0].src;

        mainImage.alt =
            `${data.title} ${data.images[0].label} 화면`;



        /* =====================================================
           주요 제작 내용
        ====================================================== */

        featureList.innerHTML = "";


        data.features.forEach((feature) => {

            const li =
                document.createElement("li");


            li.innerHTML = `

                <strong>
                    ${feature.title}
                </strong>

                <span>
                    ${feature.description}
                </span>

            `;


            featureList.appendChild(li);

        });



        /* =====================================================
           프로젝트 정보
        ====================================================== */

        projectInfo.innerHTML = "";


        Object.entries(data.info)
            .forEach(([key, value]) => {

                const div =
                    document.createElement("div");


                div.innerHTML = `

                    <dt>
                        ${key}
                    </dt>

                    <dd>
                        ${value}
                    </dd>

                `;


                projectInfo.appendChild(div);

            });



        /* =====================================================
           기술
        ====================================================== */

        techList.innerHTML = "";


        data.tech.forEach((tech) => {

            const span =
                document.createElement("span");


            span.textContent =
                tech;


            techList.appendChild(span);

        });



        /* =====================================================
           모달 활성화
        ====================================================== */

        modal.classList.add(
            "is-open"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );


        modalClose.focus();

    }



    /* =========================================================
       이미지 교체
    ========================================================== */

    function changeMainImage(
        src,
        title,
        label,
        button
    ) {

        mainImage.classList.add(
            "is-changing"
        );


        setTimeout(() => {

            mainImage.src =
                src;

            mainImage.alt =
                `${title} ${label} 화면`;


            mainImage.classList.remove(
                "is-changing"
            );

        }, 120);



        document
            .querySelectorAll(
                ".portfolio-thumbnail"
            )
            .forEach((thumbnail) => {

                thumbnail.classList.remove(
                    "is-active"
                );

            });


        button.classList.add(
            "is-active"
        );

    }



    /* =========================================================
       모달 닫기
    ========================================================== */

    function closePortfolioModal() {

        modal.classList.remove(
            "is-open"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );


        if (lastFocusedElement) {

            lastFocusedElement.focus();

        }

    }



    /* =========================================================
       카드 클릭
    ========================================================== */

    document
        .querySelectorAll(
            ".portfolio-card-button"
        )
        .forEach((card) => {

            card.addEventListener(
                "click",
                () => {

                    openPortfolioModal(
                        card.dataset.portfolio
                    );

                }
            );


            card.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        openPortfolioModal(
                            card.dataset.portfolio
                        );

                    }

                }
            );

        });



    /* =========================================================
       닫기 버튼
    ========================================================== */

    modalClose.addEventListener(
        "click",
        closePortfolioModal
    );



    /* =========================================================
       배경 클릭
    ========================================================== */

    modal.addEventListener(
        "click",
        (event) => {

            if (event.target === modal) {

                closePortfolioModal();

            }

        }
    );



    /* =========================================================
       ESC 닫기
    ========================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                modal.classList.contains(
                    "is-open"
                )
            ) {

                closePortfolioModal();

            }

        }
    );



    /* =========================================================
       문의 버튼
    ========================================================== */

    contactButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "/#contact";

        }
    );

});