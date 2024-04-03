function submitSurveyResponse(exhibitName, data) {
    return fetch('/survey/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ exhibitName, data })
    })
    .then(response => {
        if (response.ok) {
            console.log('Survey response submitted successfully.');
            // Redirect to the summary page
            window.location.href = '/summary';
        } else {
            console.error('Failed to submit survey response.');
            throw new Error('Failed to submit survey response');
        }
    })
    .catch(error => {
        console.error('Error submitting survey response:', error);
        throw error;
    });
}