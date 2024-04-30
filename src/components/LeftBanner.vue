<script setup>
const collapse = () => {
  if(document.getElementsByClassName("layout-padding")[0].style.width === "0px") {
      document.getElementsByClassName("layout-padding")[0].style.width = "20vw";
      document.getElementsByClassName("layout-padding")[0].style.padding = "2rem";
      document.getElementsByClassName("auto-size")[0].style.opacity = "1"
  } else {
      document.getElementsByClassName("layout-padding")[0].style.width = "0px";
      document.getElementsByClassName("auto-size")[0].style.opacity = "0"
      document.getElementsByClassName("layout-padding")[0].style.padding = "0px";
  }
}
</script>

<template>
    <div class="layout-padding flex-column-center-even radial-gradient">
      <div class="auto-size">
        <h1>ERD to LookML</h1>
        <span>Upload Your Image</span>
      </div>
      <button @click="collapse()" class="absolute-items absolute-buttons"><span style="font-weight:bold;">>></span></button>
    </div>
</template>

<style scoped>
.left-column {
    width:30vw;
    height:100vh;
    background-color:rgba(255.255,100);
    z-index:1;
;}
.radial-gradient {
    background: radial-gradient(circle, rgba(255,255,255,0.4) 86%, rgba(91,140,255,0.2) 100%);
  }
  .fade-enter-active {
    transition: all 0.5s ease-out;
  }

  .fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .fade-enter-from,
  .fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }
  
  .root {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .layout-padding {
    padding-left: 2rem;
    width: 30vw;
    height:100%;
    box-shadow:rgba(255, 255, 255, 0.06) 0px 1px 4px;
    transition: 0.5s ease-in-out;
  }

  .layout-padding-right {
    position: relative;
    width: 100%;
    padding-left:2rem;
    padding-right: 2rem;
    height: 100%;
  }

  .absolute-buttons {
    width:3rem;
    height:2rem;
    border-radius:1rem;
    background-color: #FFF;
    color: black;
    font-size: 1rem;
    font-weight: bold;
    box-shadow:rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }

  .absolute-items {
    position: absolute;
    top: 1rem;
    right: -2rem;
    z-index:10;
    cursor:pointer;
    bottom: 0;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .flex-column-center-even {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    align-content: center;
    height:100vh;
    width:30vw;
  }
</style>