import { api } from "../api.js";
import { cloneFallback, fallbackReviews } from "../demo-data.js";
import { formatDate, renderAlert, renderBadge, renderMetricCard, renderSpinner, renderTable, showToast } from "../components/ui.js";

export function createAdminReviewsPage() {
    return {
        title: "Reviews Moderation",
        subtitle: "Review customer feedback, monitor satisfaction trends, and remove inappropriate or incorrect comments.",
        content: `
            <div id="admin-reviews-feedback"></div>
            <div class="stats-grid" id="admin-reviews-stats">
                ${renderMetricCard("Total reviews", "—")}
                ${renderMetricCard("Average rating", "—")}
                ${renderMetricCard("Five-star reviews", "—")}
            </div>

            <article class="content-card" style="margin-top: 1rem;">
                <div class="table-toolbar">
                    <div class="field-group">
                        <label for="admin-review-search">Search reviews</label>
                        <input class="search-input" id="admin-review-search" type="search" placeholder="Search by comment, rental ID, or vehicle">
                    </div>
                    <div class="field-group">
                        <label for="admin-review-rating">Minimum rating</label>
                        <select class="select" id="admin-review-rating">
                            <option value="">All ratings</option>
                            <option value="5">5 stars only</option>
                            <option value="4">4 stars and above</option>
                            <option value="3">3 stars and above</option>
                        </select>
                    </div>
                </div>
                <div id="admin-reviews-table">${renderSpinner("Loading reviews...")}</div>
            </article>
        `,
        async afterRender() {
            const feedback = document.getElementById("admin-reviews-feedback");
            const stats = document.getElementById("admin-reviews-stats");
            const table = document.getElementById("admin-reviews-table");
            const searchInput = document.getElementById("admin-review-search");
            const ratingFilter = document.getElementById("admin-review-rating");

            let reviews = [];

            const response = await api.get("/reviews", {
                fallbackData: cloneFallback(fallbackReviews)
            });

            reviews = Array.isArray(response.data) ? response.data : [];

            if (response.fallback) {
                feedback.innerHTML = renderAlert("The reviews endpoint is unavailable, so this moderation view is showing demo feedback.", "warning");
                showToast(response.message, "warning", "Demo mode");
            }

            function renderStats() {
                const average = reviews.length
                    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
                    : "0.0";
                const fiveStars = reviews.filter((review) => Number(review.rating) === 5).length;

                stats.innerHTML = `
                    ${renderMetricCard("Total reviews", String(reviews.length))}
                    ${renderMetricCard("Average rating", average)}
                    ${renderMetricCard("Five-star reviews", String(fiveStars))}
                `;
            }

            function renderReviews() {
                const search = (searchInput.value || "").trim().toLowerCase();
                const minimumRating = Number(ratingFilter.value || 0);

                const filtered = reviews.filter((review) => {
                    const searchHaystack = `${review.id} ${review.comment || ""} ${review.rental?.vehicle?.brand || ""} ${review.rental?.vehicle?.model || ""}`.toLowerCase();
                    const matchesSearch = !search || searchHaystack.includes(search);
                    const matchesRating = !minimumRating || Number(review.rating) >= minimumRating;
                    return matchesSearch && matchesRating;
                });

                table.innerHTML = renderTable(
                    [
                        { label: "Rental", render: (review) => `<strong>#${review.rental?.id || review.id}</strong><br><span class="muted">${review.rental?.vehicle?.brand || ""} ${review.rental?.vehicle?.model || ""}</span>` },
                        { label: "Rating", render: (review) => renderBadge(`${review.rating}/5`, Number(review.rating) >= 4 ? "success" : Number(review.rating) >= 3 ? "warning" : "danger") },
                        { label: "Comment", render: (review) => review.comment || "No comment" },
                        { label: "Review Date", render: (review) => formatDate(review.reviewDate) },
                        {
                            label: "Actions",
                            render: (review) => `<button class="danger-button" type="button" data-delete-review="${review.id}">Delete</button>`
                        }
                    ],
                    filtered,
                    "No reviews match the current moderation filters."
                );

                renderStats();
            }

            table.addEventListener("click", async (event) => {
                const button = event.target.closest("[data-delete-review]");
                if (!button) return;

                const reviewId = Number(button.dataset.deleteReview);
                button.disabled = true;

                try {
                    await api.delete(`/reviews/${reviewId}`);
                    reviews = reviews.filter((review) => Number(review.id) !== reviewId);
                    renderReviews();
                    showToast("Review deleted successfully.", "success", "Moderation updated");
                } catch (error) {
                    feedback.innerHTML = renderAlert(error.message || "Review deletion failed.", "error");
                } finally {
                    button.disabled = false;
                }
            });

            searchInput.addEventListener("input", renderReviews);
            ratingFilter.addEventListener("change", renderReviews);
            renderReviews();
        }
    };
}
