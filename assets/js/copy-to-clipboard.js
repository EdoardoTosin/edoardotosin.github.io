document.addEventListener('DOMContentLoaded', () => {
  // Select all copy buttons
  const copyCodeButtons = document.querySelectorAll('.copy-code-button');

  // Iterate through all copy buttons
  copyCodeButtons.forEach(copyCodeButton => {
    // Find the nearest code block sibling
    const codeBlock = copyCodeButton.closest('.code-header').nextElementSibling.querySelector('code');

    if (codeBlock) {
      copyCodeButton.addEventListener('click', () => {
        // Get and trim the code, then copy it to the clipboard
        const code = codeBlock.innerText.trim(); // Trim leading and trailing spaces
        window.navigator.clipboard.writeText(code).catch(err => {
          console.error('Failed to copy: ', err);
        });

        // Update the button text visually
        const originalText = copyCodeButton.innerText;
        copyCodeButton.innerText = 'Copied!';

        // Toggle a class for styling the button
        copyCodeButton.classList.add('copied');

        // After 2 seconds, reset the button to its initial UI
        setTimeout(() => {
          copyCodeButton.innerText = originalText;
          copyCodeButton.classList.remove('copied');
        }, 2000);
      });
    }
  });
});
