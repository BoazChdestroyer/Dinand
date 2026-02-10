import pygame
from pygame.locals import *
pygame.init()


pygame.display.set_caption("1v1 Air Hockey")
clock = pygame.time.Clock()
HEIGHT, WIDTH = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))

ICE = (180, 220, 255)
WHITE = (255, 255, 255)
RED = (220, 50, 50)
BLUE = (50, 100, 220)

screen.fill(ICE)
pygame.draw.circle(screen, WHITE, [HEIGHT // 2, WIDTH // 2], 10, 0)
pygame.draw.circle(screen, WHITE, [HEIGHT // 2, WIDTH // 2], 50, 2)
pygame.draw.line(screen, WHITE, [WIDTH // 2, 0], [WIDTH // 2, HEIGHT], 2)
pygame.draw.rect(screen, WHITE, [0, 0, WIDTH, HEIGHT], 2)

pygame.display.update()

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    screen.fill((0, 0, 0))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
