import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Plan, Spot } from 'src/types/index';
import { Model } from 'mongoose';
import { PlanDto } from 'src/types/dto/plan.dto';

@Injectable()
export class PlanService {

    constructor(
        @InjectModel('plan') private readonly planModel: Model<Plan>,
        @InjectModel('spot') private readonly spotModel: Model<Spot>
    ){};

    async getAll(){
        try {
            const plans = await this.planModel.find({deletedAt: null}).exec();// Excluding soft deleted documents

            if(plans.length === 0){
                return {message: `Plans not found`}
            }

            return plans  
        } catch (error) {
            return {message: 'An unexpected error ocurred on DB', error}
        }
    };

    async getById(idPlan: string){
        try {
            const plan = await this.planModel
                .findById(idPlan)
                .where('deletedAt').equals(null) // Exclude soft deleted plans
                .exec()

            if(!plan){
                return {message: `Plan with id: ${idPlan} not found`}
            }

            return plan
        } catch (error) {
            return {message: 'An unexpected error ocurred on DB', error}
        }
    }

    async getByName(namePlan: string){
        try {
            const plan = await this.planModel.findOne({name: namePlan, deletedAt: null}).exec(); // Excluding soft deleted documents

            if(!plan){
                return {message: `Plan with name: ${namePlan} not found`}
            }

            return plan
        } catch (error) {
            return {message: 'An unexpected error ocurred on DB', error};
        }
    }

    async createPlan(newPlan: PlanDto){
        try {
            const planExisted = await this.planModel.findOne({name: newPlan.name, deletedAt: null}).exec(); // Excluding soft deleted documents

            if(planExisted){
                return {message: `Plan with name: ${newPlan.name} already existed under id: ${planExisted._id}`}
            }

            const planCreated = new this.planModel(newPlan);

            await planCreated.save();

            return planCreated
        } catch (error) {
            return {message: 'An unexpected error ocurred on DB', error};
        }
    }

    async updatePlan(idPlan: string, newPlan: PlanDto){
        try {
            const updatedPlan = await this.planModel.findByIdAndUpdate(
                idPlan, 
                newPlan, 
                {new: true, runValidators: true})
                .where({deletedAt: null}) // Excluding soft deleted documents
                .exec(); 

            if(!updatedPlan){
                return {message: `Plan under id: ${idPlan} not found`}
            }

            return updatedPlan
        } catch (error) {
            return {message: 'An unexpected error ocurred on DB', error};
        }
    }

    async deletePlan(idPlan){
        try {
            //Soft delete implemented to avoid DB error queries on future
            const deletedPlan = await this.planModel.findByIdAndUpdate(
                idPlan,
                { deletedAt: new Date() },
                { new: true }
                )

            if(!deletedPlan){
                return {message: `Plan under id: ${idPlan} not found`}
            }

            return deletedPlan
        } catch (error) {
            return {message: 'An unexpected error ocurred on DB', error};
        }
    };
}
