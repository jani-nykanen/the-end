/*! Status
 * @author Jani Nykänen
 */ 

 /*! Status class */
 class Status
 {
    /*! Init status */
    static Init()
    {
        this.Reset();
    }

    /*! Reset status */
    static Reset()
    {
        this.health = 5;
        this.bombs = 3;
        this.level = 1;
        this.exp = 0;
        this.chain = 10;
        this.chainExp = 0;
        this.chainWait = 0;
        this.score = 0;

        this.bossHealth = 10000;

    }

    /*! Add points
     * @param points Amount of points
     */
    static AddPoints(points)
    {
        this.score += points * (this.chain);
        this.chainExp += points/this.chain / 10.0;

        if(points != 1000)
        {
            this.exp += points/ (250 * this.level);
        }

        if(this.chainExp >= 1.0)
        {
            while(this.chainExp > 1.0)
            {
                this.chainExp -= 1.0;
                this.chain ++;
            }
        }

        this.chainWait = 30;
    }

    /*! Update status
     * @param timeMod Time modifier
     */
    static Update(timeMod)
    {
        if(this.level == 9)
            this.exp = 1.0;

        if(this.chainWait <= 0)
        {
            this.chainExp -= 0.001;
        }
        else
        {
            this.chainWait -= 1.0 * timeMod;
        }
        if(this.chainExp < 0.0)
        {
            if(this.chain > 10)
            {
                this.chain --;
                this.chainExp += 1.0;
            }
            else
            {
                this.chain = 10;
                this.chainExp = 0.0;
            }
        }

        if(Controls.keystate[80] == State.Pressed && this.level < 9)
        {
            this.exp = 1.0;
        }

        if(this.exp >= 1.0 && this.level < 9)
        {
            GameObjects.CreateMessage("Level Up!",160 - 9*8,96,-3);

            this.exp -= 1.0;
            this.level ++;
        }
    }
 }