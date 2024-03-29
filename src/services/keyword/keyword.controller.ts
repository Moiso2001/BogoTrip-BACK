import { Controller, Get, Put, Post, Delete, Param, Body } from '@nestjs/common';
import { Keyword, Message } from 'src/types';
import { KeywordDto } from 'src/types/dto/keyword.dto';
import { KeywordService } from './keyword.service';


@Controller('keywords')
export class KeywordController {

    constructor(private readonly KeywordService: KeywordService){};

    @Get()
    getAll(): Promise<Keyword[] | Message>{
        return this.KeywordService.getAll()
    };

    @Get('id/:id')
    getKeywordById(@Param('id') id: string): Promise<Keyword | Message>{
        return this.KeywordService.getKeywordById(id)
    };

    @Get('name/:name')
    getKeywordByName(@Param('name') name: string): Promise<Keyword | Message>{
        return this.KeywordService.getKeywordByName(name)
    };

    @Post()
    createKeyword(@Body() newKeyword: KeywordDto): Promise<Keyword | Message>{
        return this.KeywordService.createKeyword(newKeyword.name ? {...newKeyword, name: newKeyword.name.toLowerCase()}: newKeyword) // We validate if name exist to avoid Type error undefined if name is not passed at lowercase method
    };

    @Put(':id')
    updateKeyword(@Param('id') id: string, @Body() keyword: KeywordDto): Promise<Keyword | Message>{
        return this.KeywordService.updateKeywords(id, keyword.name ? {...keyword, name: keyword.name.toLowerCase()}: keyword) // We validate if name exist to avoid Type error undefined if name is not passed at lowercase method
    };

    @Delete(':id')
    deleteKeyword(@Param('id') id:string): Promise<Message | Keyword>{
        return this.KeywordService.deleteKeyword(id)
    };
};