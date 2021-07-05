//teclas
var upP1 = 87 ,downP1 = 83
var upP2 = 38 , downP2 = 40

//movimento
var mvUpP1 = mvDownP1 = mvUpP2 = mvDownP2 =false
var speed = 9

//skin mapa
var ball = {
    radius:80,
    x:650,
    y:50,
    color:'#00f',
    held:false
}


let ctx, p1_y, p2_y, p1_points, p2_points
let bola_y_orientation, bola_x_orientation, bola_x, bola_y
let p1_key, p2_key
const height_do_canvas=600, width_do_canvas=1300
const largura_dos_plays=10, altura_dos_plays=100
const p1_x = 10, p2_x = width_do_canvas - largura_dos_plays - 10
function setup (){
    const cnv = document.querySelector('canvas')
    ctx = cnv.getContext('2d')

    // inicializa as posições y do p1 e do p2 para metade da tela
    p1_y = p2_y = (height_do_canvas / 2 ) - (altura_dos_plays / 2)

    // inicializa os pontos dos jogadores como 0
    p1_points = 0
    p2_points = 0

     //define um intervalo de 60 fps para o loop
     setInterval(loop,1000/60)
     
     
     reseta_bola()
}


function loop (){
//chamar a funçao para desenhar tudo
    desenha()

//Verifica se a bola está colidindo com o barra do player 1
    if(bola_x >= p1_x && bola_x <= p1_x + 10 && bola_y >= p1_y && bola_y <= p1_y + altura_dos_plays){
        bola_x_orientation = 1
    }
    //Verifica se a bola está colidindo com o barra do player 2
    else if(bola_x >= p2_x && bola_x <= p2_x + 20 && bola_y >= p2_y && bola_y <= p2_y + altura_dos_plays){
        bola_x_orientation = -1
    }

    // verifica se a bola bateu no chão ou no teto
    if(bola_y + 10 >= height_do_canvas || bola_y <= 0) bola_y_orientation *= -1

    //move a bola no eixo X e Y
    bola_x += 10 * bola_x_orientation
    bola_y += 10 * bola_y_orientation
//mover os playes
    if(mvUpP1 && !mvDownP1){
        p1_y -= speed
}
    if(mvDownP1 && !mvUpP1){
    p1_y += speed
}
    if(mvUpP2 && !mvDownP2){
    p2_y -= speed
}
    if(mvDownP2 && !mvUpP2){
    p2_y += speed
}


//limite de tela para playes
p1_y = Math.max(0,p1_y)
p1_y = Math.min(height_do_canvas - altura_dos_plays , p1_y)
p2_y = Math.max(0,p2_y)
p2_y = Math.min(height_do_canvas - altura_dos_plays ,p2_y)


//pontuaçao
if(bola_x+10 > width_do_canvas) {
    p1_points++
    reseta_bola()
}
else if(bola_x < 0){
    p2_points ++
    reseta_bola()
}

} //fim do loop

function writePoints(){
    ctx.font = "50px monospace";
    ctx.fillStyle = "#fff";
    // w/4 = 1/4 da tela = metade da tela do player 1
    ctx.fillText(p1_points, width_do_canvas/4, 50);
    // 3*(w/4) = 3/4 da tela = metade da tela do player 2
    ctx.fillText(p2_points, 3*(width_do_canvas/4), 50);
}


//essa funçao reseta a bola apos o gol
function reseta_bola (){
    console.log(`${p1_points} VS ${p2_points}`)
    bola_y_orientation = Math.pow(2, Math.floor( Math.random() * 2 )+1) - 3 
    bola_x_orientation = Math.pow(2, Math.floor( Math.random() * 2 )+1) - 3 
    bola_x = width_do_canvas / 2 -10
    bola_y = height_do_canvas / 2 -10
}
//desenhar circulo
function desenhaCirculo(){
            ctx.strokeStyle = "#fff"
            
            ctx.beginPath() /**informando que vou começar a desenhar um circulo**/
            ctx.arc(width_do_canvas/2,height_do_canvas/2,ball.radius,0,Math.PI*2)/**o desenho       https://www.youtube.com/watch?v=pKw2oykJZdM   12:03**/
            ctx.closePath()/**iformando que to terminando o desenho**/
            //ctx.fill()/**irformar que é para preencher o desenho**/
            ctx.lineWidth = 5;
            ctx.stroke()
}

//construtor para o desenho
function desenhaRect (x,y,w,h,color = "#fff"){
    ctx.fillStyle = color
    ctx.fillRect(x,y,w,h)
    ctx.fillStyle = "#000"
}
//desenha
function desenha (){
    // fundo
    desenhaRect(0,0,width_do_canvas,height_do_canvas,"#016530")
    
    // player 1
    desenhaRect(p1_x, p1_y, largura_dos_plays, altura_dos_plays,"#725AC1")
    // player 2
    desenhaRect(p2_x, p2_y, largura_dos_plays, altura_dos_plays,"#DB222A")
    // barra central
    desenhaRect(width_do_canvas/2 -5,0,5,height_do_canvas)
    
    // bola
    desenhaRect(bola_x, bola_y, 15, 15,"#0F0607")

    desenhaCirculo()
    writePoints()
}
//evento de teclas pára mover o player
document.addEventListener("keydown" ,function(ev){
    keyP1 = ev.keyCode
    switch(keyP1){
        case upP1:
                mvUpP1 = true
                break
        case downP1:
                mvDownP1 = true
                break
        case upP2:
            mvUpP2 = true
            break
        case downP2:
            mvDownP2 = true
            break
    }
})

    document.addEventListener("keyup" ,function(ev){
        keyP1 = ev.keyCode
        switch(keyP1){
            case upP1:
                    mvUpP1 = false
                    break
            case downP1:
                    mvDownP1 = false
                    break
            case upP2:
                mvUpP2 = false
                break
            case downP2:
                mvDownP2 = false
                break
        }
})

setup()