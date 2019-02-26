################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../src/main.c \
../src/stm32f1xx_it.c \
../src/syscalls.c \
../src/system_stm32f1xx.c 

OBJS += \
./src/main.o \
./src/stm32f1xx_it.o \
./src/syscalls.o \
./src/system_stm32f1xx.o 

C_DEPS += \
./src/main.d \
./src/stm32f1xx_it.d \
./src/syscalls.d \
./src/system_stm32f1xx.d 


# Each subdirectory must supply rules for building sources it contributes
src/%.o: ../src/%.c
	@echo 'Building file: $<'
	@echo 'Invoking: MCU GCC Compiler'
	@echo $(PWD)
	arm-none-eabi-gcc -mcpu=cortex-m3 -mthumb -mfloat-abi=soft -DSTM32 -DSTM32F1 -DSTM32F103C8Tx -DDEBUG -DSTM32F103xB -DUSE_HAL_DRIVER -I"/media/data/D/Dropbox/shared/Tobias-tmbscience/STM32/projects/UARTprint/HAL_Driver/Inc/Legacy" -I"/media/data/D/Dropbox/shared/Tobias-tmbscience/STM32/projects/UARTprint/inc" -I"/media/data/D/Dropbox/shared/Tobias-tmbscience/STM32/projects/UARTprint/CMSIS/device" -I"/media/data/D/Dropbox/shared/Tobias-tmbscience/STM32/projects/UARTprint/CMSIS/core" -I"/media/data/D/Dropbox/shared/Tobias-tmbscience/STM32/projects/UARTprint/HAL_Driver/Inc" -O0 -g3 -Wall -fmessage-length=0 -ffunction-sections -c -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" -o "$@" "$<"
	@echo 'Finished building: $<'
	@echo ' '


