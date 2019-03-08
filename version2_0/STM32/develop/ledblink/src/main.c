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

	while (1) {
		HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
		HAL_Delay(200);
	}
}
