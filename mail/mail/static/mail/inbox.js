document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      if (result['error']){
        message = document.querySelector('#recipients-message');
        message.style.display = 'block';
        message.innerHTML = result['error'];
      } else {
        load_mailbox('sent');
      }
    });

    // Stop from from submitting
    return false;
  }
}

function load_mailbox(mailbox) {
  emailsView = document.querySelector('#emails-view')
  // Show the mailbox and hide other views
  emailsView.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  emailsView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Add div for emails
  const emailGroup = document.createElement('div');
  emailGroup.classList.add('list-group')
  emailGroup.id = 'emails-list'
  emailsView.append(emailGroup)

  // Request emails for mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach( email => {
      // Style emails as a Bootstrap list group
      const emailLink = document.createElement('button');
      const emailClasses = ['list-group-item', 'list-group-item-action'];
      emailLink.classList.add(...emailClasses);
      emailLink.id = `email-link-${email.id}`
      // emailLink.onclick = loadEmail(email.id);
      
      // Display emails
      document.querySelector('#emails-list').append(emailLink);

      // Create area for email info to display
      const emailInfo = document.createElement('ul')
      emailInfo.classList.add(...['list-group', 'list-group-horizontal'])
      emailInfo.id = `email-info-group-${email.id}`
      document.querySelector(`#email-link-${email.id}`).append(emailInfo)

      // Gather info to display
      displayInfo = [`<b>From:</b> ${email.sender}`,
                     `<b>Subject:</b> ${email.subject}`,
                     `<b>Sent at:</b> ${email.timestamp}`]
      displayInfo.forEach( info => {
        const infoItem = document.createElement('li');
        infoItem.classList.add(...['list-group-item', 'flex-fill', 'border-0']);
        infoItem.innerHTML = info;
        document.querySelector(`#email-info-group-${email.id}`).append(infoItem)
      })

    })
  })
}