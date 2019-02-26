################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
S_SRCS += \
../startup/startup_stm32.s 

OBJS += \
./startup/startup_stm32.o 


# Each subdirectory must supply rules for building sources it contributes
startup/%.o: ../startup/%.s
	@echo 'Building file: $<'
	@echo 'Invoking: MCU GCC Assembler'
	@echo $(PWD)
	arm-none-eabi-as -mcpu=cortex-m3 -mthumb -mfloat-abi=soft -I"/media/data/D/Dropbox/shared/Tobias-tmbscience/STM32/projects/UARTprint/HAL_Driver/Inc/Legacy" -I"/media/data/D/Dropbox/shared/Tobias-tmbscience/STM32/projects/UARTprint/inc" -I"/media/data/D/Dropbox/shared/Tobias-tmbscience/STM32/projects/UARTprint/CMSIS/device" -I"/media/data/D/Dropbox/shared/Tobias-tmbscience/STM32/projects/UARTprint/CMSIS/core" -I"/media/data/D/Dropbox/shared/Tobias-tmbscience/STM32/projects/UARTprint/HAL_Driver/Inc" -o "$@" "$<"
	@echo 'Finished building: $<'
	@echo ' '


