# 🔐 Evidence Vault

I built this after my cybersecurity camp, where every lab involved writing up vulnerabilities, their severity, remediation steps and screenshots by hand into Google Doc. It worked but was slow, messy to organize and repetative and a pain to share cleanly with teammates. Evidence Vault is my attempt at building a proper tool for this. A place to log findings, add evidence files and share a finding with someone else without giving them full access to everything. 

I also used it as an excuse to actually implement security properly as opposed to just reading about it, most of the interesting parts of this repo are less about the CRUD app and more about implementing the decisions underneath it(what's visible to who, how uploaded files are validated, how sharing can happen without a login and stuff like that).

🔗 **Live app:** https://evidence-vault-nine.vercel.app

---

## 🍿 Video

https://github.com/user-attachments/assets/9b6a35aa-5d16-402b-a1a1-7a5b1b44925d

---

## ✨ Features

- Create, edit and delete findings (title, severity, description, remediation, status)
- Attach screenshots/evidence files to a finding
- Share one specific finding with someone else via a link (they don't need an account)
- Every action gets logged in to a database table (who did what and when), but isn't shown to users

---

## 🛡️ Security Decisions

This is the part I actually spent most of my time on:

- **Every query checks ownership, not just login status.** Being logged in only proves who you are, it doesn't mean you should be able to see finding ID 47 just because you guessed the URL. Every database query filters by the finding's owner *and* the logged in user's ID together, so a user can't reach someone elses data even if they know the exact ID. I tested this directly with two separate accounts trying to access each others stuff.
- **Uploaded files are checked by their actual content and not their name.** Renaming `virus.exe` to `photo.png` doesn't fool this. The app reads the real first bytes of the file to confirm what it actually is then reprocesses the image through Sharp which also strips out anything hidden in the file's metadata.
- **Every file gets a hash on upload** and it's checked again every time it's downloaded, so I can tell if a file was changed or corrupted after it was uploaded.
- **Share links don't use passwords or logins** — they use a long random code thats practically impossible to guess and they expire automatically after a set time (which i set as 7 days automatically).
- **Nothing gets silently deleted from the log.** Create, edit, delete, upload, download, share. All of it gets a permanent record, mainly because thats the whole point of an evidence tool, if something doesn't seem right we should be able to see the log history.

More detail(what I was actually defending against and what I know is still weak) is in `SECURITY.md`(./SECURITY.md).

---

## 🧱 Built With

Vite · React · Tailwind CSS
Node.js · Express
PostgreSQL
Docker · GitHub Actions
Jest · Supertest

---

## 🚀 Running It Locally

```bash
git clone https://github.com/Naiel-Yohannes/Evidence-Vault.git
cd Evidence-Vault

# Backend
cd Backend
npm install
# .env needs POSTGRESQL_URL, SECRET (secret for the jwt), PORT
psql "$POSTGRESQL_URL" -f schema.sql
npm run dev

# Frontend
cd Frontend
npm install
npm run dev
```

---

## 🧪 Testing

```bash
cd Backend
npm run test
```

---

## 🧠 What I Learned Building This

- How to actually stop IDOR instead of just knowing it. The fix is to check ownership on every query.
- That trusting a file's extension is meaningless and why checking the real bytes is important.
- That password hashing(bcrypt) and file integrity hashing(SHA-256) look similar but are built for opposite goals, one is supposed to be slow and the other fast.
- The share link, that is building something that has *no* login requirement forced me to think differently about security, since theres no "who is this" question to fall back on at all.

---

## 🔭 What's Not Done Yet

- Files are stored on the server's disk not in a real cloud storage, so if the server disk dies the evidence is gone
- Login tokens are kept in localStorage, not a more locked down cookie
- Anyone with a share link can view a finding, theres no way to check who is actually opening it

Full reasoning for these in  `SECURITY.md`(./SECURITY.md).
