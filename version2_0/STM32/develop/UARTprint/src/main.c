/**
 ******************************************************************************
 * @file    main.c
 * @author  Ac6
 * @version V1.0
 * @date    01-December-2013
 * @brief   Default main function.
 ******************************************************************************
 */

#include "stm32f1xx.h"
#include <stdint.h>
#include <string.h>
#include <stdlib.h>
#include <stdarg.h>

#define DEBUG_UART USART1
#define delay for(int i=0;i<500000;i++)

static void printMsg(char *msg, ...);
void SystemClock_Config(void);

int main(void) {

	HAL_Init();
	SystemClock_Config();

	__HAL_RCC_GPIOC_CLK_ENABLE()
	;

	GPIO_InitTypeDef gpio;
	gpio.Mode = GPIO_MODE_OUTPUT_PP;
	gpio.Speed = GPIO_SPEED_FREQ_MEDIUM;
	gpio.Pin = GPIO_PIN_13;
	gpio.Pull = GPIO_PULLUP;

	HAL_GPIO_Init(GPIOC, &gpio);

	RCC->APB2ENR |= RCC_APB2ENR_IOPAEN | RCC_APB2ENR_AFIOEN | RCC_APB2ENR_USART1EN;
	GPIOA->CRH |= GPIO_CRH_CNF9_1 | GPIO_CRH_MODE9_0 | GPIO_CRH_MODE9_1;
	GPIOA->CRH &= ~(GPIO_CRH_CNF9_0);

	USART1->BRR = 0x1d4C;
	USART1->CR1 |= USART_CR1_TE;
	USART1->CR1 |= USART_CR1_UE;

	while (1) {

		HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
		HAL_Delay(100);
		printMsg("hello STM32\n\r");
	}
}

static void printMsg(char *msg, ...) {
	char buff[80];

	va_list args;
	va_start(args, msg);

	vsprintf(buff, msg, args);

	for (int i = 0; i < strlen(buff); i++) {

		USART1->DR = buff[i];
		while (!(USART1->SR & USART_SR_TXE))
			;

	}
}

void SystemClock_Config(void) {
	RCC_ClkInitTypeDef clkinitstruct = { 0 };
	RCC_OscInitTypeDef oscinitstruct = { 0 };

	oscinitstruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
	oscinitstruct.HSEState = RCC_HSE_ON;
	oscinitstruct.HSIState = RCC_HSI_OFF;
	oscinitstruct.PLL.PLLState = RCC_PLL_ON;
	oscinitstruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
	oscinitstruct.PLL.PLLMUL = RCC_PLL_MUL9;
	if (HAL_RCC_OscConfig(&oscinitstruct) != HAL_OK) {
		while (1)
			;
	}

	clkinitstruct.ClockType = (RCC_CLOCKTYPE_SYSCLK |
	RCC_CLOCKTYPE_HCLK |
	RCC_CLOCKTYPE_PCLK1 |
	RCC_CLOCKTYPE_PCLK2);
	clkinitstruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
	clkinitstruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
	clkinitstruct.APB2CLKDivider = RCC_HCLK_DIV1;
	clkinitstruct.APB1CLKDivider = RCC_HCLK_DIV2;
	if (HAL_RCC_ClockConfig(&clkinitstruct, FLASH_LATENCY_2) != HAL_OK) {
		while (1)
			;
	}
}

