document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(email=null) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields if not replying to an email
  if (email === null) {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  } else {
    subject = email.subject.startsWith('Re: ') ? email.subject : 'Re: ' + email.subject
    body = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}`
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = body;
  }

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
  document.querySelector('#email-view').style.display = 'none';
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
      const readClass = email.read ? 'bg-light' : 'bg-white'
      emailLink.classList.add(...['list-group-item', 'list-group-item-action', readClass]);
      emailLink.id = `email-link-${email.id}`
      emailLink.addEventListener('click', () => loadEmail(email.id));
      
      // Display emails
      document.querySelector('#emails-list').append(emailLink);

      // Create area for email info to display
      const emailInfo = document.createElement('ul')
      emailInfo.classList.add(...['list-group', 'list-group-horizontal', readClass])
      emailInfo.id = `email-info-group-${email.id}`
      document.querySelector(`#email-link-${email.id}`).append(emailInfo)

      // Gather info to display
      displayInfo = [`<b>From:</b> ${email.sender}`,
                     `<b>Subject:</b> ${email.subject}`,
                     `<b>Sent at:</b> ${email.timestamp}`]
      displayInfo.forEach( info => {
        const infoItem = document.createElement('li');
        infoItem.classList.add(...['list-group-item', 'flex-fill', 'border-0', readClass]);
        infoItem.innerHTML = info;
        document.querySelector(`#email-info-group-${email.id}`).append(infoItem)
      })

    })
  })
}

function loadEmail(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then( email => {
    // Hide everything and display an error message if something goes wrong
    if (email['error']) {
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'none';
      document.querySelector('.container').innerHTML = `<h3>${error}</h3>`;
    } else {
      // Hide other views and show email view
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';

      // Mark email as read unless read
      if (!email.read) {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }

      // Parse body text as HTML for better formatting when displayed
      let htmlBody = email.body.split('\n').filter( line => line.length > 0)
      .map( line => `<p>${line}</p>`).join('');

      // Display email
      document.querySelector('#email-sender').innerHTML = email.sender;
      document.querySelector('#email-recipients').innerHTML = email.recipients;
      document.querySelector('#email-subject').innerHTML = email.subject;
      document.querySelector('#email-body').innerHTML = htmlBody;
      document.querySelector('#email-timestamp').innerHTML = email.timestamp;

      // Ready archive button
      archiveButton = document.querySelector('#archive-button');
      archiveButton.innerHTML = email.archived ? 'Unarchive' : 'Archive';
      archiveButton.onclick = () => toggleArchive(email.id, email.archived);

      // Set up reply button
      document.querySelector('#reply-button').onclick = () => compose_email(email)
    }
  })
}

// Toggle the archived state of an email
function toggleArchive(id, archived) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !archived
    })
  })
  load_mailbox('inbox');
}