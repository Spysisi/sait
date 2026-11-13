(() => {
"use strict";
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const safeGet=key=>{try{return localStorage.getItem(key)}catch{return null}};
const safeSet=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const validViews=new Set(["home","schedule","canteen","news","clubs","game"]);
function showView(view){
 if(!validViews.has(view))view="home";
 $$(".view").forEach(s=>s.classList.toggle("active",s.id===view));
 $$("[data-nav]").forEach(a=>{const active=a.dataset.nav===view;a.classList.toggle("active",active);if(active)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
 $("#mobileNav")?.classList.remove("open");$("#menuToggle")?.setAttribute("aria-expanded","false");
 const names={home:"Главная",schedule:"Расписание",canteen:"Столовая",news:"Новости VK",clubs:"Кружки",game:"Перемена"};
 document.title=names[view]+" · Школьный сайт № 218";
 window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
}
function routeFromHash(){showView((location.hash||"#home").slice(1))}
window.addEventListener("hashchange",routeFromHash);
$$('a[href^="#"]').forEach(a=>a.addEventListener("click",()=>{const route=a.getAttribute("href").slice(1);if(validViews.has(route))showView(route)}));
routeFromHash();
if(safeGet("school218-theme")==="dark")document.documentElement.dataset.theme="dark";
$("#themeToggle").addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;safeSet("school218-theme",next)});
$("#menuToggle").addEventListener("click",()=>{const nav=$("#mobileNav");const open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open))});
$("#currentDate").textContent=new Intl.DateTimeFormat("ru-RU",{timeZone:"Asia/Novosibirsk",weekday:"long",day:"numeric",month:"long"}).format(new Date());
$("#year").textContent=String(new Date().getFullYear());

let content=null;
async function loadContent(){
 try{
  const response=await fetch("./data/content.json",{cache:"no-store"});if(!response.ok)throw new Error("HTTP "+response.status);
  content=await response.json();renderScheduleClasses();renderMenuDays();renderClubs();initQuiz();
 }catch(error){
  console.error("Не удалось загрузить демонстрационные данные",error);
  $("#scheduleResult").innerHTML='<div class="empty-state"><span class="empty-emoji">⚠️</span><h2>Не удалось загрузить данные</h2><p>Запусти сайт через start.bat или локальный веб-сервер, а не двойным щелчком по HTML-файлу.</p></div>';
  $("#clubsResult").innerHTML='<div class="empty-state"><span class="empty-emoji">⚠️</span><h2>Данные недоступны</h2><p>Проверь запуск через локальный веб-сервер.</p></div>';
  $("#menuResult").innerHTML='<div class="empty-state"><span class="empty-emoji">⚠️</span><h2>Данные недоступны</h2><p>Проверь запуск через локальный веб-сервер.</p></div>';
 }
}
function renderScheduleClasses(){
 const select=$("#classSelect");select.innerHTML='<option value="">Выбери класс…</option>';
 (content.classes||[]).forEach(name=>{const option=document.createElement("option");option.value=name;option.textContent=name;select.append(option)});
 const saved=safeGet("school218-class");if(saved&&[...select.options].some(o=>o.value===saved))select.value=saved;
 if(select.value)renderSchedule();
 select.addEventListener("change",()=>{safeSet("school218-class",select.value);renderSchedule()});
}
function renderSchedule(){
 const selected=$("#classSelect").value,target=$("#scheduleResult");
 if(!selected){target.innerHTML='<div class="empty-state"><span class="empty-emoji">📅</span><h2>Сначала выбери класс</h2><p>После выбора здесь будет показана информация только для него.</p></div>';return}
 target.innerHTML='<div class="empty-state"><span class="empty-emoji">🗂️</span><h2>Расписание для '+escapeHTML(selected)+' не подтверждено</h2><p>В переданных материалах нет проверенного расписания этого класса. Оно не подменяется выдуманными уроками. Данные можно добавить после проверки у школы.</p></div>';
}
const weekdayLabels=["Понедельник","Вторник","Среда","Четверг","Пятница"];
function renderMenuDays(){
 const holder=$("#menuDays");holder.replaceChildren();
 weekdayLabels.forEach((day,index)=>{const button=document.createElement("button");button.type="button";button.className="day-tab"+(index===0?" active":"");button.textContent=day;button.addEventListener("click",()=>{$$(".day-tab",holder).forEach(b=>b.classList.remove("active"));button.classList.add("active");renderMealDay(day)});holder.append(button)});
 renderMealDay(weekdayLabels[0]);
}
function renderMealDay(day){
 $("#menuResult").innerHTML=["Завтрак","Обед"].map((meal,index)=>'<article class="meal-card"><span class="meal-emoji">'+(index===0?"🥣":"🍲")+'</span><p class="eyebrow">'+day.toUpperCase()+'</p><h2>'+meal+'</h2><p>Демонстрационная карточка. Утверждённое меню школы не предоставлено.</p></article>').join("");
}
let clubs=[];let favorites=new Set(safeJSON(safeGet("school218-favorites"),[]));
function renderClubs(){
 const search=$("#clubSearch").value.trim().toLowerCase(),category=$("#clubCategory").value,favOnly=$("#favoritesOnly").getAttribute("aria-pressed")==="true";
 const filtered=clubs.filter(c=>(!search||(c.name||"").toLowerCase().includes(search))&&(category==="all"||c.category===category)&&(!favOnly||favorites.has(c.id)));
 const target=$("#clubsResult");
 if(!filtered.length){target.innerHTML='<div class="empty-state" style="grid-column:1/-1"><span class="empty-emoji">🎨</span><h2>Список кружков ожидает проверки</h2><p>В прототипе предусмотрены поиск, фильтрация и избранное. Карточки появятся после подтверждения занятий и руководителей школой.</p></div>';return}
 target.innerHTML=filtered.map(c=>'<article class="club-card"><h3>'+escapeHTML(c.name)+'</h3><p>'+escapeHTML(c.description||"")+'</p><button class="favorite-button" data-fav="'+escapeHTML(c.id)+'" type="button">'+(favorites.has(c.id)?"★ В избранном":"☆ В избранное")+'</button></article>').join("");
}
["input","change"].forEach(type=>{$("#clubSearch").addEventListener(type,renderClubs);$("#clubCategory").addEventListener(type,renderClubs)});
$("#favoritesOnly").addEventListener("click",e=>{const button=e.currentTarget,active=button.getAttribute("aria-pressed")!=="true";button.setAttribute("aria-pressed",String(active));button.textContent=active?"★ Только избранное":"☆ Избранное";renderClubs()});
$("#clubsResult").addEventListener("click",e=>{const button=e.target.closest("[data-fav]");if(!button)return;const id=button.dataset.fav;favorites.has(id)?favorites.delete(id):favorites.add(id);safeSet("school218-favorites",JSON.stringify([...favorites]));renderClubs()});

let questionIndex=0,score=0,answered=false,quiz=[];
function initQuiz(){quiz=content.quiz||[];$("#quizNext").addEventListener("click",nextQuestion);$("#restartQuiz").addEventListener("click",startQuiz);startQuiz()}
function startQuiz(){questionIndex=0;score=0;answered=false;$("#quizBox").classList.remove("hidden");$("#quizFinish").classList.add("hidden");renderQuestion()}
function renderQuestion(){
 const item=quiz[questionIndex];if(!item)return finishQuiz();answered=false;
 $("#quizProgress").textContent="Вопрос "+(questionIndex+1)+" из "+quiz.length;$("#quizProgressBar").style.width=(questionIndex/quiz.length*100)+"%";
 $("#quizQuestion").textContent=item.question;$("#quizScore").textContent="Баллы: "+score;$("#quizFeedback").textContent="";$("#quizNext").disabled=true;$("#quizNext").textContent=questionIndex===quiz.length-1?"Результат →":"Дальше →";$("#quizAnswers").replaceChildren();
 item.answers.forEach((answer,index)=>{const button=document.createElement("button");button.type="button";button.className="answer-option";const letter=document.createElement("span");letter.className="answer-letter";letter.textContent=String.fromCharCode(65+index);const label=document.createElement("span");label.textContent=answer;button.append(letter,label);button.addEventListener("click",()=>answerQuestion(index));$("#quizAnswers").append(button)});
}
function answerQuestion(selected){
 if(answered)return;answered=true;const item=quiz[questionIndex],buttons=$$(".answer-option",$("#quizAnswers"));
 buttons.forEach((button,index)=>{button.disabled=true;if(index===item.correct)button.classList.add("correct");else if(index===selected)button.classList.add("wrong")});
 if(selected===item.correct)score++;$("#quizScore").textContent="Баллы: "+score;$("#quizFeedback").textContent=(selected===item.correct?"Верно! ":"Не совсем. ")+item.explanation;$("#quizNext").disabled=false;
}
function nextQuestion(){if(!answered)return;questionIndex++;renderQuestion()}
function finishQuiz(){
 $("#quizBox").classList.add("hidden");$("#quizFinish").classList.remove("hidden");$("#quizProgressBar").style.width="100%";$("#finishScore").textContent=score+" из "+quiz.length;
 $("#finishMessage").textContent=score===quiz.length?"Отличный результат!":score>=4?"Хорошая работа! Можно попробовать ещё раз.":"Попробуй ещё раз — теперь вопросы будут знакомее.";
 const best=Math.max(Number(safeGet("school218-quiz-best")||0),score);safeSet("school218-quiz-best",String(best));$("#bestScore").textContent="Твой лучший результат на этом устройстве: "+best+" из "+quiz.length;
}
loadContent();
})();