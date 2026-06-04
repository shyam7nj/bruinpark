
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath} from 'url';

const BACKEND_URL = "http://localhost:3001";
const note = `Playwright test post ${Date.now()}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testLogin(page, overrides = {}){
    // Backend test login route to avoid Google OAuth
    const response = await page.request.post(`${BACKEND_URL}/auth/test-login`, {
        data: {
            email: overrides.email || "test@g.ucla.edu",
            name: overrides.name || "Test User",
            isAdmin: overrides.isAdmin || false,
            verificationStatus: overrides.verificationStatus || "verified",
        },
    });
    // Ensure succesful login
    expect(response.ok()).toBeTruthy();
}



// Test: Log-in -> Create Post -> Check post appears on dashboard
test("logged-in user can create a parking post and see it on the dashboard", async({page}) => {
    await testLogin(page, {
        email: "test-create@g.ucla.edu",
        name: "Test Create User",
        verificationStatus: "verified",
    });

    await page.goto("/create-post");

    // Choose parking structure and fill out notes
    await page.getByLabel(/parking structure/i).selectOption("Structure 4");
    await page.getByLabel(/notes/i).fill(note);

    // Set busy times
    await page.getByLabel(/day/i).selectOption("thursday");
    await page.getByLabel(/start time/i).fill("18:00");
    await page.getByLabel(/end time/i).fill("20:00");

    // Add schedule time and check it appears in the preview
    await page.getByRole("button", {name: /add time/i}).click();
    await expect(page.getByText(/thursday:/i)).toBeVisible();
    await expect(page.getByText(/18:00 - 20:00/i)).toBeVisible();

    // Submit post form
    await page.getByRole('button', { name: /^create post$/i }).click();

    // Confirm success message pops up after creating the post
    await expect(page.getByText(/parking post successfully created/i)).toBeVisible();

    await page.goto("/dashboard");

    // Check that the dashboard loads and the newly created post is there
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /my posts/i })).toBeVisible();

    await expect(page.getByText(note)).toBeVisible();
    const createdPostCard = page.locator(".dashboard-post-card").filter({
        hasText: note, 
    });

    await expect(createdPostCard).toContainText("Structure 4");
    await expect(createdPostCard).toContainText("thursday");
    await expect(createdPostCard).toContainText("18:00 - 20:00");
});

// Test: Log-in -> Attempt to create post with missing fields -> Show post wasn't completed, and warnings displayed
test("create post form shows validation before submitting incomplete post", async ({page}) => {
    await testLogin(page, {
        email: "test-validation@g.ucla.edu",
        name: "Test Validation User",
        verificationStatus: "verified",
    });

    await page.goto("/create-post");

    // Try submitting a post without choosing a parking structure
    await page.getByRole("button", {name: /^create post$/i}).click();
    await expect(page.getByText(/please select a parking structure/i)).toBeVisible();

    // Choose a structure, but leave the schedule part empty
    await page.getByLabel(/parking structure/i).selectOption("Structure 7");
    await page.getByRole("button", {name: /^create post$/i}).click();
    await expect(page.getByText(/please add at least one schedule item/i)).toBeVisible();
});

// Test: Log in -> Create Post -> Confirm you can filter it on /browse-posts
test("logged-in user can browse posts and filter by day and structure", async({page}) => {
    const browseNote = `Browse filter test post ${Date.now()}`;
    await testLogin(page, {
        email: "test-browse@g.ucla.edu",
        name: "Test Browse User",
        verificationStatus: "verified",
    });

    await page.goto("/create-post");

    // Create a post that should match the browse filters
    await page.getByLabel(/parking structure/i).selectOption("Structure 4");
    await page.getByLabel(/notes/i).fill(browseNote);
    await page.getByLabel(/day/i).selectOption("thursday");
    await page.getByLabel(/start time/i).fill("18:00");
    await page.getByLabel(/end time/i).fill("20:00");
    await page.getByRole("button", {name: /add time/i}).click();
    await page.getByRole("button", {name: /^create post$/i}).click();
    await expect(page.getByText(/parking post successfully created/i)).toBeVisible();

    await page.goto("/browse-posts");

    // Filter browse posts to the same day and structure
    await page.getByLabel(/day/i).selectOption("thursday");
    await page.getByLabel(/parking structure/i).selectOption("Structure 4");
    const matchingPost = page.locator(".browse-post-card").filter({
        hasText: browseNote,
    });

    // Check that the filtered result contains the post that was just created
    await expect(matchingPost).toBeVisible();
    await expect(matchingPost).toContainText("Structure 4");
    await expect(matchingPost).toContainText("thursday");
    await expect(matchingPost).toContainText("18:00 - 20:00");
});


// Test Log in (unverified permit) -> Go to permit verification page -> Page successfully loads form and instructions -> Upload attempt
test("logged-in user can open permit verification page", async({page}) => {
    await testLogin(page, {
        email: "test-verify@g.ucla.edu",
        name: "Test Verify User",
        verificationStatus: "unverified",
    });

    await page.goto("/verify");

    // Check that the protected verify page loads for a logged-in user
    await expect(page.getByRole("heading", {name: /verify your parking permit/i})).toBeVisible();
    await expect(page.getByLabel(/permit confirmation screenshot/i)).toBeVisible();
    await expect(page.getByRole("button", {name: /submit for review/i})).toBeVisible();

    // Check that the instructions card is visible
    await expect(page.getByText(/screenshot requirements/i)).toBeVisible();
    await expect(page.getByText(/show the full confirmation email/i)).toBeVisible();

    // Upload a fake permit screenshot and submit it for review
    await page.getByLabel(/permit confirmation screenshot/i).setInputFiles(
        path.join(__dirname, "fixtures", "fake-permit.png")
    );

    await page.getByRole("button", {name: /submit for review/i}).click();

    // Confirm the verification submission succeeded
    await expect(page.getByText(/permit verification submitted for review/i)).toBeVisible();

});

