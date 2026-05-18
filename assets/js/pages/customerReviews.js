import { api } from "../api.js";
import { cloneFallback, fallbackRentals, fallbackReviews } from "../demo-data.js";
import {
    escapeHtml,
    formatDate,
    renderAlert,
    renderBadge,
    renderEmptyState,
    renderMetricCard,
    renderSpinner,
    setElementHtml,
    showToast
} from "../components/ui.js";

function renderReviewCards(reviews) {
    if (!reviews.length) {
        return renderEmptyState({
            title: "No reviews submitted yet",
            description: "Share your first review after a completed rental to help the team keep quality high.",
            icon: "★"
        });
    }

    return `
        <div class="review-list">
            ${reviews.map((review) => `
                <article class="list-card">
                    <div class="summary-row">
                        <div>
                            <h3 class="section-title">Rental #${review.rental?.id || review.id}</h3>
                            <span class="muted">${escapeHtml(`${review.rental?.vehicle?.brand || ""} ${review.rental?.vehicle?.model || ""}`.trim() || "Vehicle review")}</span>
                        </div>
                        ${renderBadge(`${review.rating}/5`, review.rating >= 4 ? "success" : review.rating >= 3 ? "warning" : "danger")}
                    </div>
                    <p>${escapeHtml(review.comment || "No comment provided.")}</p>
                    <span class="muted">Reviewed on ${formatDate(review.reviewDate)}</span>
                </article>
            `).join("")}
        </div>
    `;
}

export function createCustomerReviewsPage({ user }) {
    return {
        title: "Reviews",
        subtitle: "Leave feedback on completed rentals and keep a history of what you have already rated.",
        content: `
            <div id="reviews-feedback"></div>
            <div class="stats-grid" id="review-stats">
                ${renderMetricCard("Pending reviews", "—")}
                ${renderMetricCard("Submitted reviews", "—")}
                ${renderMetricCard("Average rating", "—")}
            </div>

            <div class="split-grid" style="margin-top: 1rem;">
                <article class="content-card">
                    <h2 class="section-title">Submit a review</h2>
                    <form id="review-form" class="stack" novalidate>
                        <div class="field-group">
                            <label for="rentalId">Completed rental</label>
                            <select class="select" id="rentalId" name="rentalId" required>
                                <option value="">Loading completed rentals...</option>
                            </select>
                        </div>
                        <div class="field-group">
                            <label for="rating">Rating</label>
                            <select class="select" id="rating" name="rating" required>
                                <option value="">Choose a rating</option>
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Great</option>
                                <option value="3">3 - Good</option>
                                <option value="2">2 - Needs work</option>
                                <option value="1">1 - Poor</option>
                            </select>
                        </div>
                        <div class="field-group">
                            <label for="comment">Review comment</label>
                            <textarea class="textarea" id="comment" name="comment" required placeholder="Tell us what stood out about the trip."></textarea>
                        </div>
                        <button class="button" type="submit">Submit review</button>
                    </form>
                </article>

                <article class="content-card">
                    <h2 class="section-title">Your review history</h2>
                    <div id="review-list">${renderSpinner("Loading reviews...")}</div>
                </article>
            </div>
        `,
        async afterRender() {
            const feedback = document.getElementById("reviews-feedback");
            const stats = document.getElementById("review-stats");
            const reviewList = document.getElementById("review-list");
            const form = document.getElementById("review-form");
            const rentalSelect = document.getElementById("rentalId");

            const [rentalsResponse, reviewsResponse] = await Promise.all([
                api.get("/rentals", { fallbackData: cloneFallback(fallbackRentals) }),
                api.get("/reviews", { fallbackData: cloneFallback(fallbackReviews) })
            ]);

            let rentals = Array.isArray(rentalsResponse.data) ? rentalsResponse.data : [];
            let reviews = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [];

            rentals = rentals.filter((rental) => {
                const belongsToCustomer = Number(rental?.customer?.id) === Number(user?.id);
                const completed = String(rental.status || "").toUpperCase() === "COMPLETED";
                return belongsToCustomer && completed;
            });

            reviews = reviews.filter((review) => Number(review?.rental?.customer?.id) === Number(user?.id));

            if (!rentals.length && rentalsResponse.fallback) {
                rentals = cloneFallback(fallbackRentals).filter((rental) => String(rental.status || "").toUpperCase() === "COMPLETED");
            }

            if (!reviews.length && reviewsResponse.fallback) {
                reviews = cloneFallback(fallbackReviews);
            }

            if (rentalsResponse.fallback || reviewsResponse.fallback) {
                feedback.innerHTML = renderAlert("The review workspace is showing demo data because some API calls failed.", "warning");
            }

            function getPendingRentals() {
                const reviewedIds = new Set(reviews.map((review) => Number(review?.rental?.id)));
                return rentals.filter((rental) => !reviewedIds.has(Number(rental.id)));
            }

            function renderStats() {
                const average = reviews.length
                    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
                    : "0.0";

                stats.innerHTML = `
                    ${renderMetricCard("Pending reviews", String(getPendingRentals().length))}
                    ${renderMetricCard("Submitted reviews", String(reviews.length))}
                    ${renderMetricCard("Average rating", average)}
                `;
            }

            function renderHistory() {
                reviewList.innerHTML = renderReviewCards(reviews);
            }

            function renderRentalOptions() {
                const pending = getPendingRentals();
                rentalSelect.innerHTML = pending.length
                    ? `<option value="">Choose a completed rental</option>${pending.map((rental) => `
                        <option value="${rental.id}">#${rental.id} · ${escapeHtml(`${rental.vehicle?.brand || ""} ${rental.vehicle?.model || ""}`.trim())}</option>
                    `).join("")}`
                    : `<option value="">No unrated completed rentals available</option>`;
            }

            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                feedback.innerHTML = "";

                const data = new FormData(form);
                const rentalId = Number(data.get("rentalId"));
                const rating = Number(data.get("rating"));
                const comment = String(data.get("comment") || "").trim();

                if (!rentalId || !rating || !comment) {
                    feedback.innerHTML = renderAlert("Rental, rating, and comment are all required.", "error");
                    return;
                }

                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;

                try {
                    const response = await api.post("/reviews", { rentalId, rating, comment });
                    reviews = [response.data, ...reviews];
                    form.reset();
                    renderRentalOptions();
                    renderHistory();
                    renderStats();
                    showToast("Review submitted successfully.", "success", "Thanks for the feedback");
                } catch (error) {
                    feedback.innerHTML = renderAlert(error.message || "Review submission failed.", "error");
                } finally {
                    submitButton.disabled = false;
                }
            });

            renderRentalOptions();
            renderHistory();
            renderStats();
        }
    };
}
