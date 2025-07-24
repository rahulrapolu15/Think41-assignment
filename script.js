document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const startDateInput = document.getElementById('startDate');
    const eventTimeInput = document.getElementById('eventTime');
    const recurrenceTypeSelect = document.getElementById('recurrenceType');
    const dayOfWeekGroup = document.getElementById('dayOfWeekGroup'); // For toggling visibility
    const dayOfWeekSelect = document.getElementById('dayOfWeek');
    const numOccurrencesInput = document.getElementById('numOccurrences');
    const viewWindowStartInput = document.getElementById('viewWindowStart');
    const viewWindowEndInput = document.getElementById('viewWindowEnd');
    const generateBtn = document.getElementById('generateBtn');
    const instanceListDiv = document.getElementById('instanceList');

    // --- Initial State / Default Values (can be set from HTML or here) ---
    // (HTML provides defaults, but JS can also set them if needed)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    const defaultDate = ${yyyy}-${mm}-${dd};

    startDateInput.value = defaultDate;
    viewWindowStartInput.value = defaultDate;
    
    // Set view window end 2 months from now for better initial display
    const defaultViewEnd = new Date(today);
    defaultViewEnd.setMonth(defaultViewEnd.getMonth() + 2);
    viewWindowEndInput.value = ${defaultViewEnd.getFullYear()}-${String(defaultViewEnd.getMonth() + 1).padStart(2, '0')}-${String(defaultViewEnd.getDate()).padStart(2, '0')};


    // --- Event Listeners ---
    recurrenceTypeSelect.addEventListener('change', toggleDayOfWeekVisibility);
    generateBtn.addEventListener('click', generateAndDisplayInstances);

    // Initial call to set visibility based on default selected recurrence type
    toggleDayOfWeekVisibility();

    // --- Functions ---

    function toggleDayOfWeekVisibility() {
        if (recurrenceTypeSelect.value === 'weekly') {
            dayOfWeekGroup.style.display = 'flex'; // Use flex to maintain column layout
        } else {
            dayOfWeekGroup.style.display = 'none';
        }
    }

    function generateAndDisplayInstances() {
        instanceListDiv.innerHTML = ''; // Clear previous instances

        // 1. Get Input Values
        const startDateStr = startDateInput.value;
        const eventTimeStr = eventTimeInput.value; // e.g., "09:00"
        const recurrenceType = recurrenceTypeSelect.value; // "daily" or "weekly"
        const selectedDayOfWeek = parseInt(dayOfWeekSelect.value, 10); // 0=Sun, 1=Mon...
        const numOccurrences = parseInt(numOccurrencesInput.value, 10);
        const viewWindowStartStr = viewWindowStartInput.value;
        const viewWindowEndStr = viewWindowEndInput.value;

        // Basic Validation
        if (!startDateStr || !eventTimeStr || !numOccurrences || !viewWindowStartStr || !viewWindowEndStr) {
            alert('Please fill in all required fields.');
            return;
        }
        if (numOccurrences < 1) {
            alert('Number of occurrences must be at least 1.');
            return;
        }

        // Parse Dates and Time
        const initialStartDate = new Date(startDateStr);
        // Set time to the initial start date (important for accurate comparisons later)
        const [hours, minutes] = eventTimeStr.split(':').map(Number);
        initialStartDate.setHours(hours, minutes, 0, 0); // Set time for initial date

        const viewWindowStart = new Date(viewWindowStartStr);
        viewWindowStart.setHours(0, 0, 0, 0); // Set to start of the day for accurate window comparison
        const viewWindowEnd = new Date(viewWindowEndStr);
        viewWindowEnd.setHours(23, 59, 59, 999); // Set to end of the day for accurate window comparison

        if (viewWindowStart.getTime() > viewWindowEnd.getTime()) {
            alert('View Window Start Date cannot be after View Window End Date.');
            return;
        }

        const generatedInstances = [];
        let currentIterationDate = new Date(initialStartDate); // Date to increment for next occurrence

        // 2. Generate Event Instances Based on Recurrence Type
        for (let i = 0; i < numOccurrences; i++) {
            let nextInstanceDate = new Date(currentIterationDate); // Create a new Date object for current instance

            if (recurrenceType === 'daily') {
                // For daily, currentIterationDate already has correct date/time
                // We just need to ensure time is set correctly if initialStartDate wasn't already configured
                // nextInstanceDate is already currentIterationDate copy with time.
                // No specific day alignment needed.
            } else { // weekly
                // Find the first occurrence on the selected day of the week, starting from initialStartDate
                if (i === 0) { // For the very first instance
                    while (nextInstanceDate.getDay() !== selectedDayOfWeek) {
                        nextInstanceDate.setDate(nextInstanceDate.getDate() + 1);
                    }
                    // If initialStartDate's day was already the selectedDayOfWeek, this loop does nothing.
                    // Now, nextInstanceDate is the first aligned occurrence.
                    // Make sure currentIterationDate is also updated for the loop.
                    currentIterationDate = new Date(nextInstanceDate);
                } else {
                    // For subsequent weekly occurrences, just add 7 days to the previous valid occurrence
                    nextInstanceDate.setDate(nextInstanceDate.getDate()); // Already set by previous iteration's currentIterationDate
                }
            }

            // Ensure the correct time is set for each instance (redundant if initialStartDate was fully set, but safer)
            nextInstanceDate.setHours(hours, minutes, 0, 0);

            generatedInstances.push(nextInstanceDate);

            // Prepare currentIterationDate for the next loop iteration
            // This ensures we increment correctly for daily or weekly
            if (recurrenceType === 'daily') {
                currentIterationDate.setDate(currentIterationDate.getDate() + 1);
            } else { // weekly
                currentIterationDate.setDate(currentIterationDate.getDate() + 7);
            }
        }

        // 3. Display Instances with Highlighting
        generatedInstances.forEach(instanceDate => {
            const instanceDiv = document.createElement('div');
            instanceDiv.classList.add('event-instance');

            // Determine if instance is outside view window (date comparison only)
            const instanceDateOnly = new Date(instanceDate.getFullYear(), instanceDate.getMonth(), instanceDate.getDate());
            
            const isOutsideViewWindow = 
                instanceDateOnly.getTime() < viewWindowStart.getTime() || 
                instanceDateOnly.getTime() > viewWindowEnd.getTime();

            if (isOutsideViewWindow) {
                instanceDiv.classList.add('outside-view-window');
            }

            // Format date and time for display
            const formattedDate = instanceDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = instanceDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            instanceDiv.textContent = ${formattedDate} at ${formattedTime};
            instanceListDiv.appendChild(instanceDiv);
        });
    }

    // Call generate on initial load to show some defaults
    generateAndDisplayInstances();
});
