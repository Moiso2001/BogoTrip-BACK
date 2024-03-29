import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Keyword, Message, Tag } from 'src/types';
import { TagDto } from 'src/types/dto/tag.dto';
import { KeywordDto } from 'src/types/dto/keyword.dto';


@Injectable()
export class TagService {

    constructor(
        @InjectModel('tag') private readonly tagModel: Model<Tag>,
        @InjectModel('keyword') private readonly keywordModel: Model<Keyword>
    ){};

    /* We devided the services between type requests, initially the getAll which brings all tags in DB */
    async getAll(): Promise<Tag[] | Message>{
        try {
            const tags = await this.tagModel.find({deletedAt: null}).exec();

            if(tags.length > 0){
                return tags
            }

            return {message: 'There are no tags available on DB'}
        } catch (error) {
            return {message: 'An unexpected error appears', error}
        }
    }

    /* Looking by ID */
    async getTagById(id: string): Promise<Tag | Message>{
        try {
            const tag = await this.tagModel
                .findById(id)
                .where({deletedAt: null}) // Excludes soft deleted tags
                .exec();

            if(tag){
                return tag
            }

            return {message: `Tag with id ${id} not exists in DB`}
        } catch (error) {
            return {message: 'An unexpected error appears', error}
        }
    };

    /* Looking by name */
    async getTagByName(name: string): Promise<Tag | Message>{
        try {
            const tag = await this.tagModel
                .findOne({name: name.toLowerCase()})
                .where({deletedAt: null}) // Excluding all soft deleted tags
                .exec();

            if(tag){
                return tag
            }

            return {message: `Tag with name ${name} not exists in DB`}
        } catch (error) {
            return {message: 'An unexpected error appears', error}
        }
    }; 

    /* Used to post a Tag */
    async createTag (tag: TagDto): Promise<Tag | Message>{
        try {
            // We validate if the category name already exists on 
            const tagExist = await this.tagModel.findOne({name: tag.name, deletedAt: null});

            if(tagExist){
                return {message: `Tag with name: ${tag.name} already exist`}
            };

            const newTag = new this.tagModel(tag)
            await newTag.save()

            return newTag;
        } catch (error) {
            return {message: 'An unexpected error appears', error}
        }
    };

    /* Well... any further to say update and delete... just that :) */
    async updateTag(id: string, newTag: TagDto): Promise<Tag | Message>{
        try {
            const updatedTag = await this.tagModel.findByIdAndUpdate(
                id, 
                newTag, 
                {new: true, runValidators: true})
                .where({deletedAt: null}) // Excluding soft deleted documents
                .exec();

            if(!updatedTag){
                return {message: `Tag under id: ${id} doesn't exist`}
            }
            
            return updatedTag
        } catch (error) {
            return {message: 'An unexpected error appears', error}
        }
    };

    async deleteTag(id: string): Promise<Message | Tag>{
        try {
            //Soft delete implemented to avoid DB error queries on future
            const deletedTag = await this.tagModel
                .findById(id,{ new: true })
                .where({deletedAt: null})
                .exec();

            if(!deletedTag){
                return {message: `Tag under id: ${id} not found`}
            }

            deletedTag.deletedAt = new Date();
            await deletedTag.save();

            return deletedTag        
        } catch (error) {
            return {message: 'An unexpected error appears', error}
        }
    }

    /* Keywords relation with Tag */
    async addKeywords(idTag: string, keywords: KeywordDto[]): Promise<Message | Tag>{
        try {
            const tagToUpdate = await this.tagModel
                .findById(idTag)
                .where({deletedAt: null}) // Excluding all soft deleted tags
                .exec();

            // Validate if idTag exists
            if(!tagToUpdate){
                return{message: `Tag with ID ${idTag} not found.`}
            }

            // Map the KeywordDto array to an array of keyword IDs
            const keywordIds: Array<Types.ObjectId> = [];

            for (const keyword of keywords) { 
            
              // Search the keyword and if it does not exist we will create it
              const result = await this.keywordModel.findOneAndUpdate(
                { name: keyword.name.toLowerCase(), deletedAt: null}, // Case if the name already exists
                { name: keyword.name.toLowerCase() }, // Case if the name doesn't exist and we create it here
                { upsert: true, new: true }
              );

              // We validate if the keyword already exists in the tag to avoid adding duplicates
              if(tagToUpdate.keywords.includes(result._id) || keywordIds.some(value => JSON.stringify(value) === JSON.stringify(result._id)))continue;

              keywordIds.push(result._id);
            }
        
            // Update the tag's keywords property with the new keyword IDs
            tagToUpdate.keywords = [...tagToUpdate.keywords, ...keywordIds];

            // Cleaning all keywords soft deleted (this function won't be reflected on the controller return, whatever on DB it was already updated)
            tagToUpdate.keywords.forEach(async id => {
                // Find each keyword by the id on the Tag.keywords
                const keyword =  await this.keywordModel.findById(id) 
                
                // If the keyword propety is different than null is because has a date on it, and it was already soft deleted
                if(keyword.deletedAt !== null){
                    await this.tagModel.findOneAndUpdate(
                        {_id: idTag, deletedAt: null},
                        { $pull: { keywords: keyword._id }},    // Pull method will pull out the keyword by id from our Tag.keyword array 
                    );
                }
            })

            // Save the updated tag to the database
            await tagToUpdate.save();  
            
            return tagToUpdate
        } catch (error) {
            return {message: 'An unexpected error appears', error}
        }
    };
    
    async deleteKeyword(tagId: string, keywordName: string): Promise<Message | Tag> {   
            try {
              // Search keyword by name and validate it in case the keyword name does not exist.
              const keywordToDelete = await this.keywordModel
                .findOne({name: keywordName.toLowerCase()})
                .where({deletedAt: null}) // Excluding soft deleted keywords
                .exec();
    
              if(!keywordToDelete){
                return {message: `Keyword with name ${keywordName} not found.`};
              }
    
              // Search the tag and pull the keyword provided before
              const tagToUpdate = await this.tagModel.findOneAndUpdate(
                {_id: tagId, deletedAt: null},
                { $pull: { keywords: keywordToDelete._id }},    // Pull method will pull out the keyword by id from our Tag.keyword array 
                { new: true }                                   // Will assure tagToUpdate will be the last tag version
              );
                
              if (!tagToUpdate) {
                return {message: `Tag with ID ${tagId} not found.`};
              }
          
                return tagToUpdate;
            } catch (error) {
                return {message: 'An unexpected error appears', error}
            }
    };
}
