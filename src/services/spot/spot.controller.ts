import { Controller, Get, Put, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { SpotDto, SpotRequestDto } from 'src/types/dto/spot.dto';
import { CategoryDto } from 'src/types/dto/category.dto';
import { TagDto } from 'src/types/dto/tag.dto';
import { SpotService } from './spot.service';
import { Message, Spot } from 'src/types';

@Controller('spots')
export class SpotController {
    constructor(private readonly SpotService: SpotService){}

    @Post('request')
    spotRequest(@Body() spotRequest: SpotRequestDto): Promise<Message | Spot[]>{
        const querie: SpotRequestDto = {
            ...spotRequest, 
            keyword: spotRequest.keyword && spotRequest.keyword.toLowerCase()
        }

        return this.SpotService.spotRequest(querie)
    };
    
    @Get()
    getAll() : Promise<Message | Spot[]>{
        return this.SpotService.getAll()
    };

    @Get('id/:id')
    getSpotById(@Param('id') id: string) : Promise<Message | Spot>{
        return this.SpotService.getById(id)
    };

    @Get('name/:name')
    getSpotByName(@Param('name') name: string): Promise<Message | Spot>{
        return this.SpotService.getByName(name)
    };

    @Get('pagination')
    getSpotByPagination(@Query('page') page: string, @Query('limit') limit: string){
        return this.SpotService.getPagination(page, limit);
    }

    @Post()
    createPost(@Body() newSpot: SpotDto): Promise<Message | Spot>{
        return this.SpotService.createSpot(newSpot)
    };

    @Put(':id')
    updateSpot(@Param('id') id: string, @Body() updatedSpot: SpotDto): Promise<Message | Spot>{
        return this.SpotService.updateSpot(id, updatedSpot)
    };

    @Put('categories/:idSpot')
    addCategorySpot(@Param('idSpot') idSpot: string, @Body() categories: CategoryDto[]): Promise<Message | Spot>{
        return this.SpotService.addCategorySpot(idSpot, categories)
    };

    @Put('tags/:idSpot')
    addTagSpot(@Param('idSpot') idSpot: string, @Body() tags: TagDto[]): Promise<Message | Spot>{
        return this.SpotService.addTagSpot(idSpot, tags)
    };

    @Delete(':id')
    deleteSpot(@Param('id') id: string): Promise<Message | Spot>{
        return this.SpotService.deleteSpot(id)
    };
    
    @Delete('categories/:idSpot/:categoryName')
    deleteCategory(@Param('idSpot') idSpot: string, @Param('categoryName') categoryName: string): Promise<Message | Spot>{
        return this.SpotService.deleteCategory(idSpot, categoryName.toLowerCase())
    };

    @Delete('tags/:idSpot/:tagName')
    deleteTag(@Param('idSpot') idSpot: string, @Param('tagName') tagName: string): Promise<Message | Spot>{
        return this.SpotService.deleteTag(idSpot, tagName.toLowerCase())
    };
}
