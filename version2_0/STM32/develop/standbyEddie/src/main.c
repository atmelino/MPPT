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

int main(void) {

	for (;;)
		;
}

void gotoSleep(void) {
// enable the PWR control clock
	RCC->APB1ENR |= RCC_APB1ENR_PWREN;

// Set SLEEPDEEP bit of Cortex System Control Register
	SCB->SCR |= SCB_SCR_SLEEPDEEP_Msk;

	// Enable Standby mode
	PWR->CR |= PWR_CR_PDDS;

	//clear wake up flag
	PWR->CR |= PWR_CR_CWUF;

	// Request Wait for Interrupt
	__WFI();

}
