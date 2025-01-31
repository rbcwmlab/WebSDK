/**
 * Copyright 2019 Phenix Real Time Solutions Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define([
    'phenix-web-lodash-light',
    'sdk/express/ChannelExpress',
    '../../../../test/mock/HttpStubber',
    '../../../../test/mock/WebSocketStubber',
    'sdk/room/room.json'
], function(_, ChannelExpress, HttpStubber, WebSocketStubber, room) {
    describe('When creating a channel with ExpressRoom', function() {
        var mockBackendUri = 'https://mockUri';
        var mockAuthData = {
            name: 'mockUser',
            password: 'somePassword'
        };
        var mockRoom = {
            roomId: 'TestRoom123',
            alias: '',
            name: 'Test123',
            description: 'Description',
            bridgeId: '',
            pin: '',
            type: room.types.multiPartyChat.name,
            members: []
        };

        var httpStubber;
        var websocketStubber;
        var channelExpress;
        var response;

        beforeEach(function(done) {
            httpStubber = new HttpStubber();
            httpStubber.stubAuthRequest();
            httpStubber.stubStreamRequest();

            websocketStubber = new WebSocketStubber();
            websocketStubber.stubAuthRequest();

            channelExpress = new ChannelExpress({
                backendUri: mockBackendUri,
                authenticationData: mockAuthData
            });

            response = {
                status: 'ok',
                room: mockRoom,
                members: []
            };

            websocketStubber.stubResponse('chat.CreateRoom', response);

            channelExpress.getPCastExpress().waitForOnline(done);
        });

        afterEach(function() {
            httpStubber.restore();
            websocketStubber.restore();
            channelExpress.dispose();
        });

        it('Has method createChannel', function() {
            expect(channelExpress.createChannel).to.be.a('function');
        });

        it('Expect createRoom protocol to be called with channel type', function() {
            websocketStubber.stubResponse('chat.CreateRoom', response, function(type, message) {
                expect(message.room.type).to.be.equal(room.types.channel.name);
            });

            channelExpress.createChannel({channel: mockRoom}, function() {});
        });

        it('Expect channel to be returned from createChannel', function() {
            websocketStubber.stubResponse('chat.CreateRoom', {
                status: 'ok',
                room: mockRoom
            });

            channelExpress.createChannel({channel: mockRoom}, function(error, response) {
                expect(response.channel).to.exist;
            });
        });
    });
});