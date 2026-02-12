import pygame
from pygame.locals import*
pygame.init()

pygame.display.set_caption('')
clock = pygame.time.Clock()
HEIGHT, WIDHT = 800,600
screen = pygame.display.set_mode((WIDHT,HEIGHT))

WHITE = (255,255,255)
RED =  (220,50,50)
BLUE = (50,100,220)

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False 

    screen.fill((0,0,0))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()