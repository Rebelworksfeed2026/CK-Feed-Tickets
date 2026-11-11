/* C&K Feed Tickets: private photo upload helper.
   Not wired into ticket saving until private bucket + RLS are verified.
   Never place a service-role key in browser code. */
window.CKTicketPhotos = Object.freeze({
  bucket: "feed-ticket-photos",
  validate(file) {
    if (!file) throw Error("Select a ticket photo.");
    const types = ["image/jpeg","image/png","image/webp"];
    if (!types.includes(file.type)) throw Error("Ticket photo must be JPEG, PNG, or WebP.");
    if (file.size <= 0 || file.size > 10*1024*1024)
      throw Error("Ticket photo must be under 10 MB.");
    return true;
  },
  async upload({file, ticketId, accessToken}) {
    this.validate(file);
    if (!/^[0-9a-f-]{36}$/i.test(ticketId)) throw Error("Invalid ticket ID.");
    if (!accessToken) throw Error("Sign in first.");
    if (!window.SUPABASE_URL || !window.SUPABASE_KEY) throw Error("Cloud configuration unavailable.");
    const ext = {"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[file.type];
    const path = ticketId + "/" + crypto.randomUUID() + "." + ext;
    const res = await fetch(window.SUPABASE_URL + "/storage/v1/object/" + this.bucket + "/" + path,{
      method:"POST",
      headers:{"apikey":window.SUPABASE_KEY,"Authorization":"Bearer "+accessToken,
        "Content-Type":file.type,"x-upsert":"false"},
      body:file
    });
    if (!res.ok) {
      const detail=await res.json().catch(()=>({}));
      throw Error(detail.message || detail.error || "Photo upload failed.");
    }
    return path;
  }
});
