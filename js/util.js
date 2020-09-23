function getRandomInt(num1, num2) {
    var max = (num1 > num2) ? num1 : num2
    var min = (num2 > num1) ? num1 : num2
    return (Math.floor(Math.random() * (max + 1 - min)) + min)
}