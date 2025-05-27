document.addEventListener('DOMContentLoaded', function () {
    // Get manga modal elements
    const mangaModal = document.getElementById('mangaModal');
    const addMangaBtn = document.getElementById('addMangaBtn');
    const closeMangaBtn = document.getElementById('closeModalBtn');
    const cancelMangaBtn = document.getElementById('cancelBtn');

    // Get chapter modal elements
    const chapterModal = document.getElementById('chapterModal');
    const uploadChapterBtn = document.getElementById('uploadChapterBtn');
    const closeChapterBtn = document.getElementById('closeModalBtn');
    const cancelChapterBtn = document.getElementById('cancelBtn');

    // Manga modal event handlers
    if (addMangaBtn && mangaModal) {
        addMangaBtn.addEventListener('click', function () {
            mangaModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeMangaBtn) {
        closeMangaBtn.addEventListener('click', function () {
            mangaModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (cancelMangaBtn) {
        cancelMangaBtn.addEventListener('click', function () {
            mangaModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Chapter modal event handlers
    if (uploadChapterBtn && chapterModal) {
        uploadChapterBtn.addEventListener('click', function () {
            chapterModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeChapterBtn) {
        closeChapterBtn.addEventListener('click', function () {
            chapterModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (cancelChapterBtn) {
        cancelChapterBtn.addEventListener('click', function () {
            chapterModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target === mangaModal) {
            mangaModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (event.target === chapterModal) {
            chapterModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});