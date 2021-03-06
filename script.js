
var canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;
let time = 1000; // time for each enemy in set interval funtcion...

const startBtn = document.getElementById('start');
const conatiner = document.querySelector('.container');
const end = document.querySelector('.end');
const restart = document.getElementById('restart');

var score = 0;
var scoreElement = document.getElementById('score');


//Random Number Generator in a RANGE...
function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

//Random color generatot...
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    };

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.5;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.draw();
        this.x = this.x + (this.velocity.x * friction);
        this.y = this.y + (this.velocity.y * friction);
        this.alpha -= 0.01;
    }
}


const player = new Player(innerWidth / 2, innerHeight / 2, 10, 'white');
player.draw();

const projectiles = [];
const enemies = [];
const particles = [];

function spawnEnemeies() {
    setInterval(() => {
        const radius = randomNumber(8, 25);
        var x = 0;
        var y = 0;

        if (Math.random() < 0.5) {
            x = randomNumber(0, innerWidth);
            y = Math.random() < 0.5 ? 0 - radius : innerHeight + radius;
        } else {
            y = randomNumber(0, innerHeight);
            x = Math.random() < 0.5 ? 0 - radius : innerWidth + radius;
        }

        const angle = Math.atan2(innerHeight / 2 - y, innerWidth / 2 - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(
            x,
            y,
            radius,
            getRandomColor(),
            velocity
        )
        )
    }, time);
}

let animateId;
function animate() {
    animateId = requestAnimationFrame(animate);
    time -= 1;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, index) => {
        particle.update();
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });


    projectiles.forEach(projectile => {
        projectile.update();
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        const dist = Math.hypot(
            player.x - enemy.x,
            player.y - enemy.y
        );

        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animateId);
            document.getElementById('final-score').innerHTML = score;
            end.style.display = 'inline-block';

            // console.log('end');
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
            )

            //when projectiles hit enemy...
            if (dist - enemy.radius - projectile.radius < 1) {

                score += Math.floor(enemy.radius) * 2;
                scoreElement.innerHTML = score;
                // console.log(score);
                for (let i = 0; i < enemy.radius; i++) {
                    particles.push(new Particle(
                        projectile.x,
                        projectile.y,
                        randomNumber(0, 2),
                        enemy.color,
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 7),
                            y: (Math.random() - 0.5) * (Math.random() * 7)
                        }
                    ))
                };
                if (enemy.radius < 17) {
                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0)
                } else {
                    setTimeout(() => {
                        // enemies.splice(index,1);
                        // enemy.radius -= 10;
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        });
                        projectiles.splice(projectileIndex, 1);
                    }, 0)
                }
            }
        })
    });
}

addEventListener('click', event => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    );

    const velocity = {
        x: 4 * Math.cos(angle),
        y: 4 * Math.sin(angle)
    };

    projectiles.push(
        new Projectile(
            canvas.width / 2,
            canvas.height / 2,
            4,
            'white',
            velocity
        )
    );
});

addEventListener('onmousemove', () => {
    ctx.beginPath();
    ctx.arc(100, 75, 50, 0, 2 * Math.PI);
    ctx.stroke();
});




startBtn.addEventListener('click', () => {
    // console.log(conatiner);
    time = 1000;
    conatiner.style.display = 'none';
    enemies.length = 0;
    projectileslength = 0;
    animate();
    spawnEnemeies();
});

// restart.addEventListener('click',()=>{
//     conatiner.style.display='none';
//     end.style.display = 'none';
//     enemieslength = 0;
//     projectileslength = 0;
//     animate();
//     spawnEnemeies();
// });

