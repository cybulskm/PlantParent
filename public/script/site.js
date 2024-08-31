var navb = document.getElementById("navb");
navb.innerHTML =
  '<ul class="nav-list">    <li><span class="title-text">PLANT DAD WEBAPP</span></li>    <li><a href="../index.html">HOME</a></li>     <li>      <div class="dropdown">        <a href="/plant/index" class="dropbtn">PLANTS</a>        <div class="dropdown-content">          <a href="/plant/index">VIEW PLANTS</a>          <a href="/plant/create">CREATE PLANT</a>           </div>      </div>    </li>    <li>      <div class="dropdown">        <a href="/note/index" class="dropbtn">NOTES</a>        <div class="dropdown-content">          <a href="/note/index">VIEW NOTES</a>          <a href="/note/create">CREATE NOTE</a>            </div>      </div>    </li><li>      <div class="dropdown">        <a href="/misc/tutorial" class="dropbtn">TUTORIAL</a>        </div>    </li> <li>      <div class="dropdown">        <a href="/misc/newcontent" class="dropbtn">COMING SOON...</a>        </div>    </li>   </ul>  <span class="author">Matthew Cybulski</span>';


function hidePopup(block){
    block.style.display = "none";
  }



//Detect form changes

function formChanged(plantId) {
  console.log(plantId, " clicked");
  var update_button = document.getElementById(`update_${plantId}`);
  if (update_button != null) {
    console.log("update button found");
    update_button.style.backgroundColor = "#00ff1e";
  }
}

let slideIndex = 1;
if (document.getElementsByClassName("mySlides").length > 0){
  showSlides(slideIndex);

}

// Next/previous controls
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}



function deleteNote(noteId) {
  const form = document.getElementById("deleteNote");
  form.action = `/note/delete/${noteId}`;
  form.noteId.value = noteId;
  form.submit();
}

function deletePlant(plantId) {

  const form = document.getElementById("deletePlant");
  console.log(form);
  form.action = `/plant/delete/${plantId}`;
  form.id.value = plantId;
  form.submit();
}

function popupIMG(imgId) {
  // Get the modal
  var modal = document.getElementById(`myModal_${imgId}`);
  // Get the image and insert it inside the modal - use its "alt" text as a caption
  var img = document.getElementById(`myImg_${imgId}`);
  var modalImg = document.getElementById(`img01_${imgId}`);

  if (img) {
    modal.style.display = "block";
    modalImg.src = img.src;
  }

  // Get the <span> element that closes the modal
  var span = document.getElementById(`close_${imgId}`);
  var nav = document.getElementById('navb');
  nav.style.display = "none";

  // Close the modal when the user clicks on <span> (x)
  span.onclick = function() {
    modal.style.display = "none";
    nav.style.display = "flex";
  }

  // Close the modal when the user clicks outside the modal content
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
      nav.style.display = "flex";
    }
  }

  


}

