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
    "https://cwwnarmrvpvjptytepdo.supabase.com";

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
        throw new Error(
            `첨부파일은 최대 ${MAX_FILE_COUNT}개까지 가능합니다.`
        );
    }

    files.forEach(function (file) {
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(
                `${file.name} 파일이 10MB를 초과합니다.`
            );
        }

        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            throw new Error(
                `${file.name} 파일 형식은 업로드할 수 없습니다.`
            );
        }
    });
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
                document.getElementById("budget").value || null;

            const content =
                document.getElementById("message").value.trim();

            const fileInput =
                document.getElementById("files");

            const files =
                Array.from(fileInput.files || []);

            if (
                !customerName ||
                !phone ||
                !email ||
                !projectType ||
                !content
            ) {
                alert("필수 입력 항목을 모두 작성해 주세요.");
                return;
            }

            try {
                validateFiles(files);

                submitButton.disabled = true;
                submitButton.textContent = "문의 접수 중...";

                formNotice.textContent =
                    "문의 내용과 첨부파일을 안전하게 접수하고 있습니다.";

                let uploadedFileData = [];

                if (files.length > 0) {
                    uploadedFileData =
                        await uploadInquiryFiles(files);
                }

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
                console.error(error);

                alert(
                    "문의 접수 중 오류가 발생했습니다.\n" +
                    error.message
                );

                formNotice.textContent =
                    "문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.";
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "문의 접수하기";
            }
        }
    );
}
